import React, { useMemo, useState, useEffect } from 'react';
import { useNavigation } from 'react-navi';
import { Tooltip, Icon } from 'evergreen-ui';

import storage from '../../storage';
import theme from '../../theme';
import Card from '../../components/card';
import Table from '../../components/table';
import Popup from '../../components/popup';
import DeviceLabel from '../../components/device-label';
import {
  Button,
  Row,
  Text,
  Select,
  Code,
  Checkbox,
} from '../../components/core';
import ServiceMetricsForm from './service-metrics-form';

const Service = ({
  route: {
    data: { params, applications, metrics, devices },
  },
}) => {
  const [selectedService, setSelectedService] = useState(
    storage.get('selectedService', params.project)
  );
  const [metricToDelete, setMetricToDelete] = useState();
  const [metricToEdit, setMetricToEdit] = useState();

  const addMetric = () => setMetricToEdit({});
  const clearMetricToDelete = () => setMetricToDelete(null);
  const clearMetricToEdit = () => setMetricToEdit(null);

  const submitDelete = metric => {};

  const submit = () => {};

  useEffect(() => {
    storage.set('selectedService', selectedService, params.project);
  }, [selectedService]);

  const tableData = useMemo(() => metrics, [metrics]);

  const columns = useMemo(
    () => [
      {
        Header: 'Metric',
        Cell: ({ row: { original } }) => <Code>{original.name}</Code>,
      },
      {
        Header: 'Labels',
        Cell: ({ row: { original } }) =>
          original.labels.map(label => <DeviceLabel {...label} />),
      },
      {
        id: 'Device Tag',
        Header: (
          <Row alignItems="center">
            <Tooltip content="When selected a Datadog tag with the Device ID will be included.">
              <Icon icon="info-sign" size={10} color={theme.colors.primary} />
            </Tooltip>
            <Text marginLeft={1}>Device Tag</Text>
          </Row>
        ),
        Cell: ({ row: { original } }) => (
          <Checkbox value={original.deviceTag} onChange={() => {}} />
        ),
        style: {
          flex: '0 0 125px',
          justifyContent: 'center',
        },
      },
      {
        Header: ' ',
        Cell: ({ row: { original } }) => {
          return (
            <Row>
              <Button
                title={
                  <Icon icon="edit" size={18} color={theme.colors.white} />
                }
                variant="icon"
                onClick={() => setMetricToEdit(original)}
              />
              <Button
                title={<Icon icon="trash" size={18} color={theme.colors.red} />}
                variant="icon"
                marginLeft={4}
                onClick={() => setMetricToDelete(original)}
              />
            </Row>
          );
        },
        style: {
          flex: '0 0 150px',
          justifyContent: 'flex-end',
        },
      },
    ],
    []
  );
  const selectOptions = useMemo(
    () =>
      applications
        .reduce((list, app) => {
          if (app.latestRelease) {
            return [
              ...list,
              ...Object.keys(app.latestRelease.config).map(service => ({
                app,
                service,
              })),
            ];
          }
          return list;
        }, [])
        .map(({ app, service }) => ({
          label: `${app.name}/${service}`,
          value: `${app.name}/${service}`,
        })),
    [applications]
  );

  return (
    <>
      <Row marginBottom={4} width={9}>
        <Select
          variant="black"
          onChange={setSelectedService}
          value={selectedService}
          options={selectOptions}
          placeholder="Select a Service"
          noOptionsMessage={() => (
            <Text>
              There are no <strong>Services</strong>.
            </Text>
          )}
        />
      </Row>
      <Card
        title="Service Metrics"
        size="full"
        actions={[{ title: 'Add Serice Metric', onClick: addMetric }]}
        disabled={!selectedService}
      >
        <Table
          data={tableData}
          columns={columns}
          placeholder={
            <Text>
              There are no <strong>Service Metrics</strong>.
            </Text>
          }
        />
      </Card>
      <Popup show={!!metricToEdit} onClose={clearMetricToEdit}>
        <ServiceMetricsForm
          metric={metricToEdit}
          params={params}
          metrics={metrics}
          devices={devices}
          applications={applications}
        />
      </Popup>
      <Popup show={!!metricToDelete} onClose={clearMetricToDelete}>
        <Card border title="Delete Service Metric">
          <Text>
            You are about to delete the{' '}
            <strong>{metricToDelete && metricToDelete.name}</strong> metric.
          </Text>
          <Button
            marginTop={5}
            title="Delete"
            onClick={submitDelete}
            variant="danger"
          />
        </Card>
      </Popup>
    </>
  );
};

export default Service;
