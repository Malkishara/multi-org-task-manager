const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'http://localhost:8080/api';


async function request(path, options = {}) {

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };


  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    }
  );


  const data =
    await response.json()
    .catch(() => ({}));


  if (!response.ok) {

    throw new Error(
      data.message ||
      'Something went wrong. Please try again.'
    );
  }


  return data;
}



export const authApi = {

  signup: (payload) =>
    request(
      '/auth/signup',
      {
        method:'POST',
        body:JSON.stringify(payload),
      }
    ),


  login: (payload) =>
    request(
      '/auth/login',
      {
        method:'POST',
        body:JSON.stringify(payload),
      }
    ),

};