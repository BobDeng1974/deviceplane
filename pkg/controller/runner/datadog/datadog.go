package datadog

import (
	"context"
	"sync"

	"github.com/DataDog/datadog-go/statsd"
	"github.com/apex/log"

	"github.com/deviceplane/deviceplane/pkg/agent/service/client"
	"github.com/deviceplane/deviceplane/pkg/controller/connman"
	"github.com/deviceplane/deviceplane/pkg/controller/store"
	"github.com/deviceplane/deviceplane/pkg/metrics/datadog"
	"github.com/deviceplane/deviceplane/pkg/models"
)

type Runner struct {
	projects            store.Projects
	applications        store.Applications
	devices             store.Devices
	releases            store.Releases
	metricTargetConfigs store.MetricTargetConfigs
	st                  *statsd.Client
	agentClient         *client.Client
}

func NewRunner(projects store.Projects, applications store.Applications, releases store.Releases, devices store.Devices, metricTargetConfigs store.MetricTargetConfigs, st *statsd.Client, connman *connman.ConnectionManager) *Runner {
	return &Runner{
		projects:            projects,
		applications:        applications,
		devices:             devices,
		releases:            releases,
		metricTargetConfigs: metricTargetConfigs,
		st:                  st,
		agentClient:         client.NewClient(connman),
	}
}

func (r *Runner) Do(ctx context.Context) {
	projects, err := r.projects.ListProjects(ctx)
	if err != nil {
		log.WithError(err).Error("list projects")
		return
	}

	for _, project := range projects {
		if project.DatadogAPIKey == nil {
			continue
		}

		devices, err := r.devices.ListDevices(ctx, project.ID)
		if err != nil {
			log.WithError(err).Error("list devices")
			continue
		}

		// Get metric configs
		stateMetricConfig, err := r.metricTargetConfigs.LookupMetricTargetConfig(ctx, project.ID, string(models.MetricStateTargetType))
		if err != nil || stateMetricConfig == nil {
			log.WithField("project_id", project.ID).
				WithError(err).Error("getting state metric config")
			continue
		}
		if len(stateMetricConfig.Configs) == 0 {
			continue
		}

		hostMetricConfig, err := r.metricTargetConfigs.LookupMetricTargetConfig(ctx, project.ID, string(models.MetricHostTargetType))
		if err != nil || hostMetricConfig == nil {
			log.WithField("project_id", project.ID).
				WithError(err).Error("getting host metric config")
			continue
		}
		if len(hostMetricConfig.Configs) == 0 {
			continue
		}

		serviceMetricConfig, err := r.metricTargetConfigs.LookupMetricTargetConfig(ctx, project.ID, string(models.MetricServiceTargetType))
		if err != nil || serviceMetricConfig == nil {
			log.WithField("project_id", project.ID).
				WithError(err).Error("getting service metric config")
			continue
		}
		if len(serviceMetricConfig.Configs) == 0 {
			continue
		}

		// Add apps to map by ID
		// Add services to map by name
		apps, err := r.applications.ListApplications(ctx, project.ID)
		if err != nil {
			log.WithField("project", project.ID).WithError(err).Error("listing applications")
			continue
		}
		appsByID := make(map[string]*models.Application, len(apps))
		latestAppReleaseByAppID := make(map[string]*models.Release, len(apps))
		for i, app := range apps {
			appsByID[app.ID] = &apps[i]

			release, err := r.releases.GetLatestRelease(ctx, project.ID, app.ID)
			if err == store.ErrReleaseNotFound {
				continue
			} else if err != nil {
				log.WithField("application", app.ID).
					WithError(err).Error("get latest release")
				continue
			}

			latestAppReleaseByAppID[app.ID] = release
		}

		var req datadog.PostMetricsRequest
		var wg sync.WaitGroup
		for i := range devices {
			wg.Add(1)
			go func(device models.Device) {
				defer wg.Done()

				req.Series = append(
					req.Series,
					r.getStateMetrics(ctx, &project, &device, stateMetricConfig)...,
				)

				// If the device is offline can't get non-state metrics
				// from it
				if device.Status != models.DeviceStatusOnline {
					return
				}

				req.Series = append(
					req.Series,
					r.getHostMetrics(ctx, &project, &device, hostMetricConfig)...,
				)

				req.Series = append(
					req.Series,
					r.getServiceMetrics(ctx, &project, &device, serviceMetricConfig, apps, appsByID, latestAppReleaseByAppID)...,
				)
			}(devices[i])
		}
		wg.Wait()

		client := datadog.NewClient(*project.DatadogAPIKey)
		if err := client.PostMetrics(ctx, req); err != nil {
			log.WithError(err).Error("post metrics")
			continue
		}
	}
}
