const development = {
  endpoint: 'http://localhost:8080/api',
  wsEndpoint: 'ws://localhost:8080/api',
};

const endpointBase = window.location.port
  ? `${window.location.hostname}:${window.location.port}/api`
  : `${window.location.hostname}/api`;

const production = {
  endpoint: `${window.location.protocol}//${endpointBase}`,
  wsEndpoint:
    window.location.protocol === 'http:'
      ? `ws://${endpointBase}`
      : `wss://${endpointBase}`,
};

const supportedDeviceMetrics = [
  'node_cpu_guest_seconds_total',
  'node_cpu_seconds_total',
  'node_disk_io_now',
  'node_disk_io_time_seconds_total',
  'node_disk_io_time_weighted_seconds_total',
  'node_disk_read_bytes_total',
  'node_disk_read_time_seconds_total',
  'node_disk_reads_completed_total',
  'node_disk_reads_merged_total',
  'node_disk_write_time_seconds_total',
  'node_disk_writes_completed_total',
  'node_disk_writes_merged_total',
  'node_disk_written_bytes_total',
  'node_filesystem_avail_bytes',
  'node_filesystem_device_error',
  'node_filesystem_files',
  'node_filesystem_files_free',
  'node_filesystem_free_bytes',
  'node_filesystem_readonly',
  'node_filesystem_size_bytes',
  'node_load',
  'node_memory_Active_anon_bytes',
  'node_memory_Active_bytes',
  'node_memory_Active_file_bytes',
  'node_memory_AnonPages_bytes',
  'node_memory_Bounce_bytes',
  'node_memory_Buffers_bytes',
  'node_memory_Cached_bytes',
  'node_memory_CmaFree_bytes',
  'node_memory_CmaTotal_bytes',
  'node_memory_CommitLimit_bytes',
  'node_memory_Committed_AS_bytes',
  'node_memory_Dirty_bytes',
  'node_memory_Inactive_anon_bytes',
  'node_memory_Inactive_bytes',
  'node_memory_Inactive_file_bytes',
  'node_memory_KernelStack_bytes',
  'node_memory_Mapped_bytes',
  'node_memory_MemAvailable_bytes',
  'node_memory_MemFree_bytes',
  'node_memory_MemTotal_bytes',
  'node_memory_Mlocked_bytes',
  'node_memory_NFS_Unstable_bytes',
  'node_memory_PageTables_bytes',
  'node_memory_SReclaimable_bytes',
  'node_memory_SUnreclaim_bytes',
  'node_memory_Shmem_bytes',
  'node_memory_Slab_bytes',
  'node_memory_SwapCached_bytes',
  'node_memory_SwapFree_bytes',
  'node_memory_SwapTotal_bytes',
  'node_memory_Unevictable_bytes',
  'node_memory_VmallocChunk_bytes',
  'node_memory_VmallocTotal_bytes',
  'node_memory_VmallocUsed_bytes',
  'node_memory_WritebackTmp_bytes',
  'node_memory_Writeback_bytes',
  'node_network_receive_bytes_total',
  'node_network_receive_compressed_total',
  'node_network_receive_drop_total',
  'node_network_receive_errs_total',
  'node_network_receive_fifo_total',
  'node_network_receive_frame_total',
  'node_network_receive_multicast_total',
  'node_network_receive_packets_total',
  'node_network_transmit_bytes_total',
  'node_network_transmit_carrier_total',
  'node_network_transmit_colls_total',
  'node_network_transmit_compressed_total',
  'node_network_transmit_drop_total',
  'node_network_transmit_errs_total',
  'node_network_transmit_fifo_total',
  'node_network_transmit_packets_total',
  'node_scrape_collector_duration_seconds',
  'node_scrape_collector_success',
  'node_textfile_scrape_error',
  'node_time_seconds',
  'promhttp_metric_handler_errors_total',
  'promhttp_metric_handler_requests_in_flight ',
  'promhttp_metric_handler_requests_total',
];

const config =
  process.env.REACT_APP_ENVIRONMENT === 'development'
    ? development
    : production;

export default {
  agentVersion: '1.8.1',
  cliEndpoint: 'https://cli.deviceplane.com',
  supportedDeviceMetrics,
  ...config,
};
