import { Task, Resource } from '../types'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface FarmContext {
  tasks: Task[]
  resources: Resource[]
  recentActivity: string
  farmStats: {
    totalAnimals: number
    totalEquipment: number
    completedTasksThisWeek: number
    feedDaysRemaining: number
    averageHealth: number
  }
}

class AIService {
  private baseUrl: string
  private apiKey: string | null
  
  constructor() {
    // Try Ollama first (local), fallback to OpenRouter (cloud)
    this.baseUrl = 'http://localhost:11434' // Ollama default
    this.apiKey = null // OpenRouter API key if available
  }

  // Generate farm context from app data
  generateFarmContext(tasks: Task[], resources: Resource[]): FarmContext {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentTasks = tasks.filter(task => task.ts >= oneWeekAgo)
    const completedTasks = recentTasks.filter(task => task.completed)
    
    const animals = resources.filter(r => r.type === 'animal')
    const equipment = resources.filter(r => r.type === 'equipment')
    
    // Calculate feed days remaining
    const feedResources = resources.filter(r => r.name.toLowerCase().includes('feed'))
    const feedTasks = tasks.filter(t => t.type === 'feeding' && !t.completed)
    const feedDaysRemaining = feedTasks.length > 0 ? 
      Math.floor(feedResources.reduce((sum, r) => sum + (r.quantity || 0), 0) / feedTasks.length) : 0
    
    // Calculate average health
    const resourcesWithHealth = resources.filter(r => r.health !== undefined)
    const averageHealth = resourcesWithHealth.length > 0 ?
      resourcesWithHealth.reduce((sum, r) => sum + (r.health || 0), 0) / resourcesWithHealth.length : 100
    
    // Generate recent activity summary
    const taskTypes = recentTasks.map(t => t.type.replace('_', ' ')).slice(0, 5)
    const recentActivity = taskTypes.length > 0 ? 
      `Recent activities: ${taskTypes.join(', ')}` : 'No recent activity logged'

    return {
      tasks,
      resources,
      recentActivity,
      farmStats: {
        totalAnimals: animals.length,
        totalEquipment: equipment.length,
        completedTasksThisWeek: completedTasks.length,
        feedDaysRemaining,
        averageHealth: Math.round(averageHealth)
      }
    }
  }

  // Create system prompt with farm context
  createSystemPrompt(context: FarmContext): string {
    return `You are FarmAI, an expert agricultural assistant for RangeTrack farm management software. You help farmers with questions about their operations and provide general farming advice.

FARM CONTEXT:
- Animals: ${context.farmStats.totalAnimals} (Average health: ${context.farmStats.averageHealth}%)
- Equipment: ${context.farmStats.totalEquipment} pieces
- Tasks completed this week: ${context.farmStats.completedTasksThisWeek}
- Feed supply: ${context.farmStats.feedDaysRemaining} days remaining
- ${context.recentActivity}

RESOURCES:
${context.resources.map(r => `- ${r.name} (${r.type}): ${r.quantity || 'N/A'} units, Health: ${r.health || 'N/A'}%`).slice(0, 10).join('\n')}

RECENT TASKS:
${context.tasks.slice(0, 5).map(t => `- ${t.type.replace('_', ' ')} (${t.completed ? 'Completed' : 'Pending'})`).join('\n')}

Instructions:
1. Always respond as a knowledgeable farming expert
2. Use the farm context above to provide personalized advice
3. Be practical and actionable in your responses
4. If asked about specific animals/equipment, reference the data above
5. Provide general farming knowledge when farm-specific data isn't available
6. Keep responses concise but informative (2-3 paragraphs max)
7. Always prioritize animal welfare and sustainable farming practices

Answer the user's farming questions with expertise and care.`
  }

  // Try Ollama first, fallback to basic responses
  async sendMessage(message: string, context: FarmContext): Promise<string> {
    const systemPrompt = this.createSystemPrompt(context)
    
    try {
      // Try Ollama (local LLM)
      const ollamaResponse = await this.tryOllama(message, systemPrompt)
      if (ollamaResponse) return ollamaResponse
      
      // Try OpenRouter (cloud LLM) if API key available
      const openRouterResponse = await this.tryOpenRouter(message, systemPrompt)
      if (openRouterResponse) return openRouterResponse
      
      // Fallback to rule-based responses
      return this.generateFallbackResponse(message, context)
      
    } catch (error) {
      console.error('AI Service error:', error)
      return this.generateFallbackResponse(message, context)
    }
  }

  private async tryOllama(message: string, systemPrompt: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2', // or 'mistral', 'codellama'
          prompt: `${systemPrompt}\n\nUser: ${message}\nFarmAI:`,
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 500
          }
        }),
      })
      
      if (!response.ok) throw new Error('Ollama not available')
      
      const data = await response.json()
      return data.response?.trim() || null
      
    } catch (error) {
      console.log('Ollama not available, trying alternatives...')
      return null
    }
  }

  private async tryOpenRouter(message: string, systemPrompt: string): Promise<string | null> {
    if (!this.apiKey) return null
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'RangeTrack AI Assistant'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free', // Free model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        }),
      })
      
      if (!response.ok) throw new Error('OpenRouter failed')
      
      const data = await response.json()
      return data.choices?.[0]?.message?.content?.trim() || null
      
    } catch (error) {
      console.log('OpenRouter failed:', error)
      return null
    }
  }

  // Rule-based fallback responses for common farming questions
  private generateFallbackResponse(message: string, context: FarmContext): string {
    const lowerMessage = message.toLowerCase()
    
    // Basic farming tools and equipment questions
    if (lowerMessage.includes('rake')) {
      return `🔧 A rake is a fundamental farming tool with a long handle and a head with multiple tines (prongs). There are several types:\n\n• **Hay Rake**: Used to gather cut grass/hay into rows for collection\n• **Garden Rake**: Has shorter tines for soil preparation and debris collection\n• **Leaf Rake**: Wide with flexible tines for gathering leaves\n• **Power Rake**: Tractor-attached for large-scale hay collection\n\nRakes are essential for hay making, field cleanup, and soil preparation. Which type were you asking about?`
    }
    
    if (lowerMessage.includes('tractor')) {
      return `🚜 A tractor is the backbone of modern farming - a powerful vehicle designed to pull or operate agricultural machinery. Key uses include:\n\n• **Field Work**: Plowing, cultivating, planting\n• **Harvesting**: Operating combines and hay equipment\n• **Transport**: Moving materials around the farm\n• **Power Source**: Running PTO-driven equipment\n\nTractors come in various sizes from compact (25-50 HP) to large (200+ HP) depending on farm needs.`
    }
    
    if (lowerMessage.includes('plow') || lowerMessage.includes('plough')) {
      return `🌾 A plow breaks and turns over soil to prepare seedbeds. Types include:\n\n• **Moldboard Plow**: Turns soil completely over\n• **Disc Plow**: Uses rotating discs to cut and turn soil\n• **Chisel Plow**: Breaks up soil without complete inversion\n\nPlowing helps control weeds, incorporate crop residue, and prepare fields for planting.`
    }
    
    if (lowerMessage.includes('harrow')) {
      return `⚡ A harrow breaks up clods and smooths soil after plowing. Types include:\n\n• **Disc Harrow**: Uses rotating discs to cut and mix soil\n• **Spring-Tooth Harrow**: Flexible teeth work through soil\n• **Drag Harrow**: Simple frame that levels and smooths\n\nHarrowing creates a fine, level seedbed for optimal plant growth.`
    }
    
    if (lowerMessage.includes('cultivator')) {
      return `🌱 A cultivator loosens soil and controls weeds between crop rows without turning the soil over like a plow. Used for:\n\n• **Weed Control**: Cutting weeds below soil surface\n• **Soil Aeration**: Breaking up compacted soil\n• **Seedbed Prep**: Creating fine, level planting surface\n\nCultivators are gentler than plows and preserve soil structure.`
    }
    
    if (lowerMessage.includes('seed drill') || lowerMessage.includes('seeder') || lowerMessage.includes('planter')) {
      return `🌰 Planting equipment ensures precise seed placement:\n\n• **Seed Drill**: Plants small grains (wheat, oats) in rows\n• **Planter**: Plants larger seeds (corn, soybeans) with spacing\n• **Broadcast Seeder**: Spreads seeds over wide area\n\nProper planting depth and spacing are crucial for good germination and yields.`
    }
    
    // Animal-related questions
    if (lowerMessage.includes('cattle') || lowerMessage.includes('cow') || lowerMessage.includes('bull')) {
      return `🐄 Cattle management involves:\n\n• **Nutrition**: 2-3% of body weight in feed daily\n• **Water**: 30-50 gallons per day\n• **Health**: Regular vaccinations, hoof care\n• **Housing**: Adequate shelter and ventilation\n• **Breeding**: Proper bull-to-cow ratios\n\nBased on your data, you have ${context.farmStats.totalAnimals} animals to care for.`
    }
    
    // Crop and field questions
    if (lowerMessage.includes('crop rotation') || lowerMessage.includes('rotation')) {
      return `🔄 Crop rotation involves growing different crops in sequence on the same field to:\n\n• **Improve Soil**: Different crops add different nutrients\n• **Control Pests**: Break disease and pest cycles\n• **Manage Weeds**: Different crops require different management\n\nCommon rotations: corn-soybeans, wheat-fallow, or more complex 4-year cycles.`
    }
    
    if (lowerMessage.includes('fertilizer') || lowerMessage.includes('fertilize')) {
      return `🧪 Fertilizers provide essential nutrients:\n\n• **Nitrogen (N)**: Promotes leaf growth and green color\n• **Phosphorus (P)**: Root development and flowering\n• **Potassium (K)**: Disease resistance and water regulation\n\nSoil testing determines exact needs. Apply based on crop requirements and soil conditions.`
    }
    
    // Feed-related questions
    if (lowerMessage.includes('feed') || lowerMessage.includes('nutrition')) {
      const { feedDaysRemaining } = context.farmStats
      if (feedDaysRemaining <= 7) {
        return `🌾 Based on your current feed inventory, you have ${feedDaysRemaining} days of feed remaining. I recommend ordering more feed soon. For cattle, a typical daily consumption is 2-3% of body weight in dry matter. Consider supplementing with hay or silage if needed.`
      }
      return `🌾 Your feed supply looks good with ${feedDaysRemaining} days remaining. For optimal nutrition, ensure your animals get a balanced diet with adequate protein (12-16% for cattle), energy, minerals, and clean water. Monitor body condition scores regularly.`
    }
    
    // Health-related questions
    if (lowerMessage.includes('health') || lowerMessage.includes('sick') || lowerMessage.includes('disease')) {
      const { averageHealth, totalAnimals } = context.farmStats
      return `🏥 Your ${totalAnimals} animals show an average health score of ${averageHealth}%. Key health practices include: regular vaccinations, parasite prevention, proper nutrition, clean water access, and good sanitation. Watch for signs like reduced appetite, lethargy, or abnormal behavior. Consult a veterinarian for serious concerns.`
    }
    
    // Weather/seasonal questions
    if (lowerMessage.includes('weather') || lowerMessage.includes('season') || lowerMessage.includes('winter') || lowerMessage.includes('summer')) {
      return `🌤️ Weather management is crucial for farming success. In winter, ensure adequate shelter, water heating, and increased feed for energy. Summer requires shade, fresh water, and heat stress prevention. Monitor weather forecasts for planning field work and protecting livestock.`
    }
    
    // Equipment questions
    if (lowerMessage.includes('equipment') || lowerMessage.includes('maintenance') || lowerMessage.includes('repair')) {
      const { totalEquipment } = context.farmStats
      return `🔧 You have ${totalEquipment} pieces of equipment tracked. Regular maintenance prevents costly breakdowns: check fluids, grease fittings, tire pressure, and belts weekly. Keep maintenance logs, store equipment properly, and address small issues before they become major problems.`
    }
    
    // Task management questions
    if (lowerMessage.includes('task') || lowerMessage.includes('schedule') || lowerMessage.includes('plan')) {
      const { completedTasksThisWeek } = context.farmStats
      return `📝 You've completed ${completedTasksThisWeek} tasks this week! Effective farm management involves: daily animal checks, regular equipment maintenance, seasonal planning, and record keeping. Prioritize tasks by urgency and weather dependence.`
    }
    
    // Seasonal farming questions
    if (lowerMessage.includes('season') || lowerMessage.includes('spring') || lowerMessage.includes('summer') || lowerMessage.includes('fall') || lowerMessage.includes('winter')) {
      return `🌤️ Seasonal farming considerations:\n\n**Spring**: Field preparation, planting, equipment maintenance\n**Summer**: Crop monitoring, pest control, haying, pasture management\n**Fall**: Harvesting, field preparation for winter, equipment storage\n**Winter**: Planning, equipment repair, livestock care, record keeping\n\nEach season has specific tasks and challenges. What season are you preparing for?`
    }
    
    // Soil questions
    if (lowerMessage.includes('soil') || lowerMessage.includes('dirt')) {
      return `🌱 Healthy soil is the foundation of farming:\n\n• **pH**: Most crops prefer 6.0-7.0 pH\n• **Nutrients**: NPK (Nitrogen, Phosphorus, Potassium)\n• **Structure**: Good drainage and air spaces\n• **Organic Matter**: 3-5% for optimal health\n\nSoil testing every 2-3 years helps guide fertilizer and lime applications.`
    }
    
    // Water and irrigation
    if (lowerMessage.includes('water') || lowerMessage.includes('irrigation') || lowerMessage.includes('irrigate')) {
      return `💧 Water management is crucial:\n\n• **Crop Needs**: Most crops need 1-2 inches per week\n• **Timing**: Early morning watering reduces disease\n• **Efficiency**: Drip irrigation saves 30-50% water\n• **Livestock**: Clean, fresh water always available\n\nMonitor soil moisture and weather forecasts for optimal timing.`
    }
    
    // Pest and disease questions
    if (lowerMessage.includes('pest') || lowerMessage.includes('bug') || lowerMessage.includes('insect') || lowerMessage.includes('disease') || lowerMessage.includes('weed')) {
      return `🐛 Integrated Pest Management (IPM) approach:\n\n• **Prevention**: Crop rotation, resistant varieties\n• **Monitoring**: Regular field scouting\n• **Biological**: Beneficial insects, natural predators\n• **Cultural**: Proper spacing, sanitation\n• **Chemical**: Last resort, targeted application\n\nEarly detection and prevention are more effective than treatment.`
    }
    
    // Financial and planning questions
    if (lowerMessage.includes('profit') || lowerMessage.includes('cost') || lowerMessage.includes('money') || lowerMessage.includes('plan')) {
      return `💰 Farm financial management tips:\n\n• **Record Keeping**: Track all expenses and income\n• **Budgeting**: Plan for seasonal cash flow\n• **Diversification**: Multiple income streams reduce risk\n• **Insurance**: Crop and livestock protection\n• **Markets**: Know your buyers and pricing\n\nConsider consulting with agricultural extension agents for detailed planning.`
    }
    
    // Basic farming terms
    if (lowerMessage.includes('what is') || lowerMessage.includes('define') || lowerMessage.includes('explain')) {
      return `📚 I can explain farming concepts! Try asking about:\n\n• **Tools**: rake, plow, harrow, cultivator, seeder\n• **Practices**: crop rotation, fertilizing, irrigation\n• **Animals**: cattle, sheep, pigs, chickens\n• **Crops**: corn, wheat, soybeans, hay\n• **Soil**: pH, nutrients, organic matter\n\nWhat specific term would you like me to explain?`
    }
    
    // General farming advice
    return `🚜 I'm here to help with your farming questions! I can provide advice on:\n\n• **Equipment & Tools**: tractors, plows, rakes, harrows\n• **Animal Care**: feeding, health, housing\n• **Crop Management**: planting, fertilizing, pest control\n• **Seasonal Planning**: spring prep, summer care, harvest\n• **Soil Health**: testing, improvement, management\n\nBased on your farm data, you're managing ${context.farmStats.totalAnimals} animals and ${context.farmStats.totalEquipment} pieces of equipment. What specific area would you like guidance on?`
  }

  // Set OpenRouter API key if available
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }
}

export const aiService = new AIService()