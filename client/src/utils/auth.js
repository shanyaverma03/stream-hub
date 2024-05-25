export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token;
};

export const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

export const getHeaders = () => ({
  headers: {
    Authorization: "Bearer " + getAuthToken(),
  },
});
