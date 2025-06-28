import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://oynakcrm.vercel.app/api", 
  }),
  tagTypes: ["Product", "Sale", "Client", "Stats"],
  endpoints: () => ({}),
});
