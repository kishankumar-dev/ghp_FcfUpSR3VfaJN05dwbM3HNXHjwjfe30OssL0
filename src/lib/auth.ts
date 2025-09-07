'use client';

const API_URL = "https://backend-account.vercel.app";

export async function signup(username: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Signup failed');
  }

  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  if (data.token) {
    // In a real app, you'd store the token securely.
    // For this prototype, we'll use localStorage.
    localStorage.setItem('userToken', data.token);
    // Store the whole user object from the response
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function logout() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('user');
  return Promise.resolve();
}
