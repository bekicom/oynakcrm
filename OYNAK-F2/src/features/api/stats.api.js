import { baseApi } from "./baseApi";

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTodayStats: builder.query({
      query: () => "/stats/today",
    }),
    getMonthlyStats: builder.query({
      query: () => "/stats/monthly",
    }),
    getTopProducts: builder.query({
      query: () => "/stats/top-products",
    }),
    // ✅ Bu yerda range bo‘yicha statistikani qo‘shamiz
    getStatsByRange: builder.query({
      query: ({ from, to }) => ({
        url: "/stats/custom",
        params: { from, to },
      }),
    }),
  }),
});

export const {
  useGetTodayStatsQuery,
  useGetMonthlyStatsQuery,
  useGetTopProductsQuery,
  useGetStatsByRangeQuery, // ✅ NOMI BU
} = statsApi;

