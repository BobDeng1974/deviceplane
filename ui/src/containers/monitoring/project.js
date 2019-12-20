import React, { useMemo, useState } from 'react';
import { useNavigation } from 'react-navi';

import Card from '../../components/card';
import Table from '../../components/table';
import { Text, Checkbox } from '../../components/core';
import api from '../../api';
import { toaster } from 'evergreen-ui';

const supportedMetrics = [
  {
    description: `Some sort of description about the various datadog things`,
    name: 'devices',
    labels: ['customer'],
  },
];

const Project = ({
  route: {
    data: { params, devices, metrics },
  },
}) => {
  const [tableData, setTableData] = useState(
    supportedMetrics.map(supportedMetric => ({
      ...supportedMetric,
      enabled: metrics.find(metric => metric.name === supportedMetric.name),
    }))
  );

  const updateMetricConfig = async metric => {
    let newMetrics;
    if (metric.enabled) {
      newMetrics = metrics.filter(({ name }) => name !== metric.name);
    } else {
      delete metric.enabled;
      newMetrics = [...metrics, metric];
    }
    try {
      await api.updateProjectMetricsConfig({
        projectId: params.project,
        data: newMetrics,
      });
      setTableData(tableData =>
        tableData.map(row =>
          row.name === metric.name
            ? { ...metric, enabled: !metric.enabled }
            : row
        )
      );
      toaster.success('Metric successfully updated.');
    } catch (error) {
      toaster.danger('Metric was not updated.');
      console.log(error);
    }
  };

  const columns = useMemo(() => {
    return [
      {
        Header: 'Datadog Tag',
        Cell: ({ row: { original } }) => (
          <Text>{`deviceplane.${original.name}`}</Text>
        ),
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Enabled',
        Cell: ({ row: { original } }) => (
          <Checkbox
            value={original.enabled}
            onChange={() => updateMetricConfig(original)}
          />
        ),
        style: {
          flex: '0 0 100px',
          justifyContent: 'center',
        },
      },
    ];
  }, []);

  return (
    <Card
      title="Project Metrics"
      size="full"
      subtitle="The predefined metrics below provide insights across the entire project."
    >
      <Table columns={columns} data={tableData} />
    </Card>
  );
};

export default Project;
