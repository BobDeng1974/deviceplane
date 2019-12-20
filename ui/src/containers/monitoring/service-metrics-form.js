import React, { useState, useMemo } from 'react';
import { useNavigation } from 'react-navi';
import useForm from 'react-hook-form';
import { toaster } from 'evergreen-ui';
import * as yup from 'yup';

import utils from '../../utils';
import api from '../../api';
import config from '../../config';
import validators from '../../validators';
import Field from '../../components/field';
import Card from '../../components/card';
import Alert from '../../components/alert';
import DeviceLabel from '../../components/device-label';
import { Form, Button, Select, Text } from '../../components/core';

const ServiceMetricsForm = ({
  params,
  metrics,
  devices,
  application,
  metric,
}) => {
  const { register, handleSubmit, errors, setValue } = useForm({});
  const navigation = useNavigation();
  const [backendError, setBackendError] = useState();

  const metricsOptions = useMemo(() => metrics, [metrics]);

  const labelsOptions = useMemo(() => {
    const uniqueLabels = devices.reduce(
      (labels, device) => [
        ...labels,
        ...Object.keys(device.labels).map(key => ({
          key,
          value: device.labels[key],
        })),
      ],
      []
    );

    return uniqueLabels.map(({ key, value }) => ({
      value: `${key}:${value}`,
      props: { label: { key, value } },
      Component: DeviceLabel,
    }));
  }, [devices]);

  const submit = async data => {
    try {
      await api.updateServiceMetricsConfig({
        projectId: params.project,
        applicationId: application.id,
        //service: selectedService,
        data,
      });
      toaster.success('Metric added successfully.');
      navigation.navigate(`/${params.project}/monitoring/device`);
    } catch (error) {
      setBackendError(utils.parseError(error));
      toaster.danger('Metric was not added.');
      console.log(error);
    }
  };

  return (
    <Card
      title={metric.name ? 'Edit Service Metric' : 'Add Service Metrics'}
      size="xlarge"
      border
    >
      <Alert show={backendError} variant="error" description={backendError} />
      <Form
        onSubmit={e => {
          setBackendError(null);
          handleSubmit(submit)(e);
        }}
      >
        <Field
          required
          autoFocus
          label="Metrics"
          name="metrics"
          as={
            <Select
              multi
              creatable
              options={metricsOptions}
              placeholder={'Select or add metrics'}
              noOptionsMessage={() => (
                <Text>
                  Start typing to add your first <strong>Metric</strong>.
                </Text>
              )}
              formatCreateLabel={value => (
                <Text>
                  {metric.name ? 'Edit' : 'Add'} <strong>{value}</strong> Metric
                </Text>
              )}
            />
          }
          setValue={setValue}
          register={register}
          errors={errors.metrics}
        />
        <Field
          label="Labels"
          name="labels"
          setValue={setValue}
          register={register}
          as={
            <Select
              multi
              options={labelsOptions}
              placeholder="Select labels"
              noOptionsMessage={() => (
                <Text>
                  There are no <strong>Labels</strong>.
                </Text>
              )}
            />
          }
          errors={errors.description}
        />
        <Button title={metric.name ? 'Edit' : 'Add'} type="submit" />
      </Form>
    </Card>
  );
};

export default ServiceMetricsForm;
