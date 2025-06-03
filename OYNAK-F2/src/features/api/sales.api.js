import { baseApi } from "./baseApi";

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // [POST] Sotuv yaratish
    createSale: builder.mutation({
      query: (body) => ({
        url: "/sales",
        method: "POST",
        body,
      }),
    }),

    // [GET] Barcha sotuvlar
    getSales: builder.query({
      query: () => "/sales",
    }),

    // [PUT] Sotuvni yangilash
    updateSale: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sales/${id}`,
        method: "PUT",
        body,
      }),
    }),

    // [DELETE] Sotuvni o‘chirish
    deleteSale: builder.mutation({
      query: (id) => ({
        url: `/sales/${id}`,
        method: "DELETE",
      }),
    }),

    // [GET] Sana oralig‘i bo‘yicha statistika
    getStatsByRange: builder.query({
      query: ({ from, to }) => `/stats?from=${from}&to=${to}`,
    }),

    // ✅ [GET] Sotuv tarixi
    getSalesHistory: builder.query({
      query: () => "/sales/history",
    }),
  }),
});

export const {
  useCreateSaleMutation,
  useGetSalesQuery,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
  useGetStatsByRangeQuery,
  useGetSalesHistoryQuery, // ✅ Yangi export
} = salesApi;
