import axios from "axios";
import Cookies from "js-cookie";

function getAuthToken() {
  return Cookies.get("token");
}

export async function createQuestion(question) {
  const token = getAuthToken();
  const url = "http://localhost:3000/api/questions";
  console.log("[createQuestion] Posting to:", url);
  console.log("[createQuestion] Payload:", question);
  console.log("[createQuestion] JWT token:", token);
  const headers = { Authorization: `Bearer ${token}` };
  console.log("[createQuestion] Headers:", headers);
  try {
    const response = await axios.post(
      url,
      question,
      {
        headers
      }
    );
    console.log("[createQuestion] Success:", response.data);
    return response;
  } catch (error) {
    if (error.response) {
      console.error("[createQuestion] Error response:", error.response.data);
      console.error("[createQuestion] Error status:", error.response.status);
      console.error("[createQuestion] Error headers:", error.response.headers);
    } else {
      console.error("[createQuestion] Error:", error.message);
    }
    throw error;
  }
}

export async function createQuestionsBulk(questions) {
  const token = getAuthToken();
  const url = "http://localhost:3000/api/questions/bulk";
  return axios.post(
    url,
    questions,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
}

export async function fetchQuestions() {
  const token = getAuthToken();
  const url = "http://localhost:3000/api/questions";
  console.log("Fetching questions from:", url);
  console.log("Headers:", { Authorization: `Bearer ${token}` });
  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function fetchAllQuestions() {
  const token = getAuthToken();
  const url = "http://localhost:3000/api/questions/all";
  console.log("Fetching ALL questions from:", url);
  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function debugShowJwtToken() {
  const token = localStorage.getItem("token");
  console.log("[debugShowJwtToken] JWT token in localStorage:", token);
  return token;
} 