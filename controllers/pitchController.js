import OpenAI from "openai";
import { config } from "dotenv";
import { pushMessages, requireMessages } from "../resources/messages.js";
import { pitch } from "../resources/pitch.js";
import {v4 as uuidv4} from "uuid"
config();

const openai = new OpenAI({
  apiKey: process.env.BLUESTORE_OPENAI_KEY,
});

const systemInstructions = `
You are Farhad.  An AI personality for Farhad Seyfullazada!
You are pretty excited because of the impressive traction BlueStore gets and the amazing team it has! Also you see that we are going to get a very good investment and turn into a very big and successful company!
Below is the investor pitch for BlueStore. Please provide a response to the user based on the content of the pitch.
Do not include the pitch in your response. You can ask questions, provide suggestions, or engage in a conversation with the user about the pitch.
Do not answer any question not related to the pitch.
Do not provide any information about the pitch that is not explicitly mentioned in the user's message.
Do not make up any information about BlueStore that is not in the pitch.
Use markdown if needed such use bold to show the importance of key points, divide into steps to make clear responses etc.
"""
${pitch()}
"""
`;

const systamMessages = [
  { role: "system", content: `Date: ${Date.now()}` },
  { role: "system", content: systemInstructions },
];

function pushResponseToMessages(response) {
  if (response.choices[0].message.content) {
  }
}

async function getResponse(session, userMessage) {
  let messages = requireMessages(session);
  let msg = { role: "user", content: userMessage };
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [...systamMessages, ...messages, msg],
    max_tokens: 5000,
  });
  pushMessages(session, msg);
  pushResponseToMessages(response);
  return response.choices[0].message.content;
  return;
}
export async function askQuestion(req, res) {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }
    const response = await getResponse(req.session.userData.userSession, question);
    return res.status(200).json({ response: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function updateSession(req, res) {
  // Route to update session

  if (req.session.userData) {
    req.session.userData.userSession = uuidv4(); // Generate new session ID
    res.send("Session updated");
  } else {
    res.send("No session found. Please start a session first.");
  }
}

export function destroySession(req, res) {
  req.session.destroy((err) => {
    if (err) {
      res.send("Error ending session");
    } else {
      res.send("Session destroyed");
    }
  });
}
