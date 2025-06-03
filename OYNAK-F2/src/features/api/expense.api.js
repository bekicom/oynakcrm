import { baseApi } from "./baseApi";

export const expensesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllExpenses: builder.query({
      query: () => "/expenses",
    }),
    createExpense: builder.mutation({
      query: (body) => ({
        url: "/expenses",
        method: "POST",
        body,
      }),
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/expenses/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;
