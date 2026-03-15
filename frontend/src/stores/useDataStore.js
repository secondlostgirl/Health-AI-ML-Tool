import { create } from 'zustand';

const initialState = {
  dataSource: 'default',
  csvData: null,
  csvFileName: null,
  csvError: null,
  targetColumn: null,
  columnMappings: {},
  mapperSaved: false,
  mapperOpen: false,
  pipelineConfig: {
    imputation: 'median',
    scaling: 'standard',
    outlierHandling: 'clip',
    featureSelection: 'all',
    trainTestSplit: 80,
  },
  pipelineStatus: 'idle',
  pipelineProgress: 0,
  pipelineLogs: [],
  pipelineDuration: null,
};

const useDataStore = create((set, get) => ({
  ...initialState,

  setCsvData: (data, fileName) =>
    set({
      csvData: data,
      csvFileName: fileName,
      csvError: null,
      dataSource: 'uploaded',
      mapperSaved: false,
      targetColumn: null,
    }),

  setCsvError: (error) => set({ csvError: error }),

  useDefaultDataset: (data) =>
    set({
      csvData: data,
      dataSource: 'default',
      csvError: null,
      csvFileName: null,
      mapperSaved: false,
      targetColumn: null,
    }),

  setTargetColumn: (col) => set({ targetColumn: col }),

  setColumnMappings: (mappings) => set({ columnMappings: mappings }),

  setMapperOpen: (open) => set({ mapperOpen: open }),

  saveMapper: () => set({ mapperSaved: true, mapperOpen: false }),

  setPipelineConfig: (key, value) =>
    set((s) => ({
      pipelineConfig: { ...s.pipelineConfig, [key]: value },
    })),

  setPipelineStatus: (status) => set({ pipelineStatus: status }),
  setPipelineProgress: (progress) => set({ pipelineProgress: progress }),
  addPipelineLog: (log) =>
    set((s) => ({ pipelineLogs: [...s.pipelineLogs, log] })),
  setPipelineDuration: (duration) => set({ pipelineDuration: duration }),

  resetPipeline: () =>
    set({
      pipelineStatus: 'idle',
      pipelineProgress: 0,
      pipelineLogs: [],
      pipelineDuration: null,
    }),

  resetAll: () => set({ ...initialState }),
}));

export default useDataStore;
