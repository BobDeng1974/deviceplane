package datadog

import (
	"context"
	"fmt"

	"github.com/apex/log"

	"github.com/deviceplane/deviceplane/pkg/controller/query"
	"github.com/deviceplane/deviceplane/pkg/metrics/datadog"
	"github.com/deviceplane/deviceplane/pkg/metrics/datadog/translation"
	"github.com/deviceplane/deviceplane/pkg/models"
)

func (r *Runner) getServiceMetrics(
	ctx context.Context,
	project *models.Project,
	device *models.Device,
	metricConfig *models.MetricTargetConfig,
	apps []models.Application,
	appsByID map[string]*models.Application,
	latestAppReleaseByAppID map[string]*models.Release,
) (metrics datadog.Series) {
	// GET the metrics endpoint
	// ON ALL DEVICES that match this application
	//
	// TODO: if things start getting slow, the runtime of this function, and
	// specifically this following section should probably be optimized
	if device.Status != models.DeviceStatusOnline {
		return nil
	}

	appIsScheduled := map[string]bool{} // we have denormalized (app, serv), (app, serv2) tuples in metricConfig.Configs
	for _, config := range metricConfig.Configs {
		if config.Params == nil {
			return nil
		}

		app, exists := appsByID[config.Params.ApplicationID]
		if !exists {
			return nil
		}

		scheduled, exists := appIsScheduled[app.ID]
		if !exists {
			var err error
			scheduled, err = query.DeviceMatchesQuery(*device, app.SchedulingRule)
			if err != nil {
				log.WithField("application", app.ID).
					WithField("device", device.ID).
					WithError(err).Error("evaluate application scheduling rule")
				scheduled = false
			}
			appIsScheduled[app.ID] = scheduled
		}
		if !scheduled {
			continue
		}

		release, exists := latestAppReleaseByAppID[app.ID]
		if !exists {
			continue
		}

		_, exists = release.Config[config.Params.Service]
		if !exists {
			continue
		}

		// Get metrics from services
		deviceMetricsResp, err := r.queryDevice(
			ctx,
			project,
			device,
			fmt.Sprintf(
				"/applications/%s/services/%s/metrics",
				app.ID, config.Params.Service,
			),
		)
		if err != nil || deviceMetricsResp.StatusCode != 200 {
			r.st.Incr("runner.datadog.unsuccessful_service_metrics_pull", addedInternalTags(project, device), 1)
			// TODO: we want to present to the user a list
			// of applications that don't have functioning
			// endpoints
			if deviceMetricsResp != nil {
				fmt.Println(deviceMetricsResp.Status)
				fmt.Println(deviceMetricsResp.StatusCode)
			}
			continue
		}
		r.st.Incr("runner.datadog.successful_service_metrics_pull", addedInternalTags(project, device), 1)

		// Convert request to DataDog format
		serviceMetrics, err := translation.ConvertOpenMetricsToDataDog(deviceMetricsResp.Body)
		if err != nil {
			log.WithField("project_id", project.ID).
				WithField("device_id", device.ID).
				WithError(err).Error("parsing openmetrics")
			continue
		}

		metrics = append(
			metrics,
			getFilteredMetrics(project, app, device, metricConfig.Type, config, serviceMetrics)...,
		)
	}

	return metrics
}
