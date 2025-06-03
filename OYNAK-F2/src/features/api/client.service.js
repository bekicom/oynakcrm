import { baseApi } from "./baseApi";

export const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // [POST] Yangi mijoz qo‘shish
    createClient: builder.mutation({
      query: (body) => ({
        url: "/clients",
        method: "POST",
        body,
      }),
    }),

    // [GET] Barcha qarzdorlarni olish
    getClients: builder.query({
      query: () => "/clients",
    }),

    // [PUT] Mijozni yangilash
    updateClient: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/clients/${id}`,
        method: "PUT",
        body,
      }),
    }),

    // [DELETE] Mijozni o‘chirish
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "DELETE",
      }),
    }),

    // [PATCH] Qarz to‘langan deb belgilash
    markClientAsPaid: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}/pay`,
        method: "PUT",
      }),
    }),

    // [PATCH] Qarz bo‘lib to‘lash (partial payment)
    addPartialPayment: builder.mutation({
      query: ({ debtId, amount }) => ({
        url: `/clients/${debtId}/pay-partial`,
        method: "PUT",
        body: { amount },
      }),
    }),
  }),
});

export const {
  useCreateClientMutation,
  useGetClientsQuery,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useMarkClientAsPaidMutation,
  useAddPartialPaymentMutation,
} = clientApi;
