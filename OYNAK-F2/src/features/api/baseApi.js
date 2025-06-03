import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api", 
  }),
  tagTypes: ["Product", "Sale", "Client", "Stats"],
  endpoints: () => ({}),
});
