import { baseApi } from "./baseApi";

export const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Barcha mijozlarni olish
    getClients: builder.query({
      query: () => "/clients",
    }),

    // 🔴 Faqat qarzdor mijozlarni olish
    getDebtorClients: builder.query({
      query: () => "/clients/debtors",
    }),

    // ➕ Yangi mijoz yaratish
    createClient: builder.mutation({
      query: (body) => ({
        url: "/clients",
        method: "POST",
        body,
      }),
    }),

    // ➕ Qo‘lda yangi qarz qo‘shish
    addDebt: builder.mutation({
      query: ({ id, debt }) => ({
        url: `/clients/${id}/add-debt`,
        method: "POST",
        body: debt,
      }),
    }),

    // ✅ Qarzni to‘langan deb belgilash
    markDebtAsPaid: builder.mutation({
      query: (debtId) => ({
        url: `/clients/${debtId}/pay`,
        method: "PUT",
      }),
    }),

    // 💸 Qarzga qisman to‘lov qo‘shish
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
  useGetClientsQuery,
  useGetDebtorClientsQuery, // 🔴 Yangi qo‘shilgan
  useCreateClientMutation,
  useAddDebtMutation,
  useMarkDebtAsPaidMutation,
  useAddPartialPaymentMutation,
} = clientApi;
