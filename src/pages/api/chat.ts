import type { NextApiRequest, NextApiResponse } from 'next';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// Advanced local AI brain for PC building
const generateResponse = async (messages: ChatMessage[]) => {
  const lastUserMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || '';
  
  // Real LLM integration (if configured)
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
           return data.candidates[0].content.parts[0].text;
        }
      }
    } catch (e) {
      console.error("Gemini API failed, falling back to local advanced brain", e);
    }
  }

  // --- Advanced Local Knowledge Base ---
  
  // Greetings
  if (lastUserMessage.match(/^(hi|hello|hey|greetings|sup)/i)) {
    const greetings = [
      "Hello! Welcome to INAN INFINITES PC Builder. How can I assist you with your PC build today?",
      "Hey there! I'm your INAN INFINITES AI assistant. Are you looking to build a new PC or upgrade an existing one?",
      "Hi! I'm ready to help you pick the perfect parts for your PC. What's your budget or use case?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Bottlenecks
  if (lastUserMessage.includes('bottleneck')) {
    return "A bottleneck occurs when one component limits the performance of another. Usually, it's a CPU-GPU bottleneck. To avoid this, balance your budget! Don't pair a super fast RTX 4090 with a slow Core i3. Tell me the CPU and GPU you want, and I'll evaluate them.";
  }

  // RAM
  if (lastUserMessage.includes('ram') || lastUserMessage.includes('memory')) {
    if (lastUserMessage.includes('ddr4') && lastUserMessage.includes('ddr5')) {
      return "DDR5 is much faster than DDR4 and is the future, but it requires a newer motherboard (like B760 or B650). If you are on a budget, DDR4 is still extremely capable and much cheaper!";
    }
    return "For gaming and general use, 16GB of RAM is the standard sweet spot. If you plan to do heavy video editing, 3D rendering, or heavy multitasking, I highly recommend going for 32GB.";
  }

  // GPU / Graphics
  if (lastUserMessage.includes('gpu') || lastUserMessage.includes('graphics') || lastUserMessage.includes('rtx') || lastUserMessage.includes('rx')) {
    return "The Graphics Card (GPU) is the most important part for gaming and rendering. NVIDIA (RTX series) is great for ray tracing, AI, and streaming. AMD (Radeon RX series) often provides better raw gaming performance per Rupee. What games do you play?";
  }

  // CPU / Processors
  if (lastUserMessage.includes('cpu') || lastUserMessage.includes('processor') || lastUserMessage.includes('intel') || lastUserMessage.includes('amd') || lastUserMessage.includes('ryzen')) {
    return "The CPU is the brain of your PC. Both Intel (Core i5/i7) and AMD (Ryzen 5/Ryzen 7) are excellent right now. For pure gaming, the Ryzen 7 7800X3D is king. For budget builds, the Intel Core i5-12400F or Ryzen 5 5600 are amazing values.";
  }

  // Motherboards
  if (lastUserMessage.includes('motherboard') || lastUserMessage.includes('mobo')) {
    return "Your motherboard connects everything. Make sure it matches your CPU's socket (e.g., AM5 for new AMD, LGA1700 for Intel). You don't need to overspend here unless you need specific features like built-in Wi-Fi, extreme overclocking, or many M.2 storage slots.";
  }

  // Storage
  if (lastUserMessage.includes('storage') || lastUserMessage.includes('ssd') || lastUserMessage.includes('hdd') || lastUserMessage.includes('nvme')) {
    return "Always choose an NVMe M.2 SSD for your main drive—it's incredibly fast and will make your PC boot in seconds. 1TB is a great starting point for gaming. You can always add a cheaper HDD later for bulk storage.";
  }

  // PSU / Power
  if (lastUserMessage.includes('power') || lastUserMessage.includes('psu') || lastUserMessage.includes('watt')) {
    return "The Power Supply (PSU) is critical. Never buy a cheap, unbranded PSU! Look for an 80+ Bronze or Gold rating from reliable brands like Corsair, Cooler Master, or EVGA. Let me know your CPU and GPU, and I can calculate the wattage you need.";
  }

  // Budgeting
  if (lastUserMessage.includes('budget') || lastUserMessage.match(/\d+k/)) {
    return "Budgeting is key! I usually recommend allocating about 40% of your budget to the GPU, 20% to the CPU, and splitting the rest among the motherboard, RAM, storage, case, and power supply. Are you including a monitor in your budget?";
  }

  // Gratitude
  if (lastUserMessage.includes('thank')) {
    const thanks = [
      "You're very welcome! Is there anything else I can assist you with?",
      "No problem at all! Building a PC is an exciting journey. Let me know if you have more questions.",
      "Glad I could help! The INAN INFINITES AI is always here if you need more advice."
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }

  // Default fallback with variation
  const fallbacks = [
    "That's a great question! Could you clarify a bit more? For example, are you asking about a specific part or a whole build?",
    "I'm an AI specializing in PC components. To give you the best answer, tell me a bit more about what you're trying to achieve.",
    "Interesting! While I'm still learning, I'm great at recommending CPUs, GPUs, and checking compatibility. What specific parts are you considering?",
    "I'm here to help you build the perfect INAN INFINITES PC! Could you provide a bit more context about your budget or use case?"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    
    // Simulate thinking delay for smoothness and realism
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
    
    const reply = await generateResponse(messages);
    
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
