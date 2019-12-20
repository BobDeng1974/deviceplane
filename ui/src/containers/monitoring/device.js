import React, { useMemo, useState } from 'react';
import { Icon, Tooltip } from 'evergreen-ui';
import { useNavigation } from 'react-navi';

import theme from '../../theme';
import Card from '../../components/card';
import Table from '../../components/table';
import Popup from '../../components/popup';
import { Row, Button, Text, Checkbox } from '../../components/core';
import { renderLabels, buildLabelColorMap } from '../../helpers/labels';
import { getMetricLabel } from '../../helpers/metrics';
import DeviceMetricsForm from './device-metrics-form';

const Device = ({
  route: {
    data: { params, devices, metrics },
  },
}) => {
  const [labelColorMap, setLabelColorMap] = useState(
    buildLabelColorMap({}, theme.labelColors, metrics)
  );
  const [metricToDelete, setMetricToDelete] = useState();
  const [metricToEdit, setMetricToEdit] = useState();

  const addMetric = () => setMetricToEdit({});
  const clearMetricToDelete = () => setMetricToDelete(null);
  const clearMetricToEdit = () => setMetricToEdit(null);

  const submitDelete = metric => {};

  const submit = () => {};

  const columns = useMemo(
    () => [
      {
        Header: 'Metric',
        Cell: ({ row: { original } }) => (
          <Text color="white">{getMetricLabel(original.name)}</Text>
        ),
      },
      {
        Header: 'Labels',
        Cell: ({ row: { original } }) =>
          renderLabels(original.labels, labelColorMap),
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
        style: { flex: '0 0 125px', justifyContent: 'center' },
      },
      {
        Header: ' ',
        Cell: ({ row: { original, index } }) => (
          <Row>
            <Button
              title={<Icon icon="edit" size={18} color={theme.colors.white} />}
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
        ),
        style: {
          flex: '0 0 150px',
          justifyContent: 'flex-end',
        },
      },
    ],
    []
  );

  const tableData = useMemo(() => metrics, [metrics]);

  return (
    <>
      <Card
        title="Device Metrics"
        size="full"
        actions={[{ title: 'Add Device Metrics', onClick: addMetric }]}
      >
        <Table
          data={tableData}
          columns={columns}
          placeholder={
            <Text>
              There are no <strong>Device Metrics</strong>.
            </Text>
          }
        />
        <Popup show={!!metricToEdit} onClose={clearMetricToEdit}>
          <DeviceMetricsForm
            metric={metricToEdit}
            params={params}
            metrics={metrics}
            devices={devices}
          />
        </Popup>
        <Popup show={!!metricToDelete} onClose={clearMetricToDelete}>
          <Card border title="Delete Device Metric">
            <Text>
              You are about to delete the{' '}
              <strong>
                {metricToDelete && getMetricLabel(metricToDelete.name)}
              </strong>{' '}
              metric.
            </Text>
            <Button
              marginTop={5}
              title="Delete"
              onClick={submitDelete}
              variant="danger"
            />
          </Card>
        </Popup>
      </Card>
    </>
  );
};

export default Device;
