const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3'); 
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const goals = require('mineflayer-pathfinder').goals
const { GoalNear } = require('mineflayer-pathfinder').goals
const collectBlock = require('mineflayer-collectblock').plugin
const pvp = require('mineflayer-pvp').plugin
const Discord = require('discord.js');
const discordAuthToken = 'Discord Bot Token';
const channelId = 'CHANNEL FOR COMMANDS';
const minecraftUsername = 'Username';
const minecraftServerHost = 'localhost';
const minecraftServerPort = '25565';
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock
const healthnum = 9
let weapon = "sword"

let followPlayer = "off"
let target = null;
var autopvp = false
var clickitem = null
var idle = false

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "Open AI Key" // Replace with your actual API key
});

const say = require('say');

function speak(text) {
    say.speak(text);
}


// Initialize Mineflayer bot
const bot = mineflayer.createBot({
  username: minecraftUsername,
  host: minecraftServerHost,
  auth: 'microsoft',
  version: '1.17.1'
});

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)
bot.loadPlugin(collectBlock)

// Function to process and type out messages


client.once('ready', () => {
  console.log('Bot is ready!');
});

let mcData
bot.once('spawn', () => {
  mcData = require('minecraft-data')(bot.version)
})

client.on('messageCreate', (msg) => {
   
  // Check if the message is from the desired channel
  
  if (msg.channelId === channelId) {
    var recentmsg = msg.content
    let accountname = recentmsg.split(" ")
    
    if (accountname[0] == minecraftUsername || accountname[0] == "all") {
    

    if (recentmsg.includes('weapon') == true) {
      let weaponmsg = recentmsg.split(" ")
      weapon = weaponmsg[2]
    }

    if (recentmsg.includes('click') == true) {
      try {
        let words = recentmsg.split(" ")
        console.log(`Attempting to accept trade`);
        bot.clickWindow(words[2], 0, 0)
          .then(() => {
            console.log(`Successfully accepted trade`);
          })
          .catch(err => {
            console.error(`Failed to accept trade`, err);
          });
      } catch (clickError) {
        console.error('Error while attempting to accept trade', clickError);
      }
    }

    if (recentmsg.includes('chat: ') == true) {
      let words = recentmsg.split(": ")
      bot.chat(words[1])
    }
    if (recentmsg.includes('toggle') == true) {
        msg.delete()
        let words = recentmsg.split(" ")

        if (words[2] == 'pvp') {
            if (autopvp == true){
                setTimeout(() => {
                    autopvp = false
                
                sendMessage(channelId, `autopvp is now ${autopvp}`)
            }, 2000);
            }
            if (autopvp == false){
                setTimeout(() => {
                    autopvp = true
                
                sendMessage(channelId, `autopvp is now ${autopvp}`)
            }, 2000);
            }
        }

        if (words[2] == 'idle') {
          if (idle == true){
              setTimeout(() => {
                idle = false
              
              sendMessage(channelId, `idle is now ${idle}`)
          }, 2000);
          }
          if (idle == false){
              setTimeout(() => {
                idle = true
              
              sendMessage(channelId, `idle is now ${idle}`)
          }, 2000);
          }
      }
    }
    if (recentmsg.includes('goto') == true) {
      
        let words = recentmsg.split(": ")
        if (words[1] == 'player') {
        console.log(words[2])
        come(words[2], "player")
        }

          if (words[1] == 'fight') {
            console.log(words[2])
            come(words[2], "fight")
            
            }

            if (words[1] == 'rox') {
                
                const defaultMove = new Movements(bot)
                defaultMove.canDig = false
                bot.pathfinder.setMovements(defaultMove)
                bot.pathfinder.setGoal(new GoalBlock(-1, 68, 12))
            }

            if (words[1] == 'gold') {
                
              const defaultMove = new Movements(bot)
              defaultMove.canDig = false
              bot.pathfinder.setMovements(defaultMove)
              bot.pathfinder.setGoal(new GoalBlock(152, 71, 52))
          }
            if (words[1] == 'pit') {
                bot.lookAt(new Vec3(0, 80, 0))
                bot.setControlState('forward', true)
                setTimeout(() => {
                    bot.setControlState('forward', false)
                }, 3000);
            }

            if (words[1] == 'follow') {
              console.log(words[2])
              followPlayer = words[2]
          }

        if (words[1] == 'harvest') {
            console.log(words[2])
            if (words[3]) {
              if (words[3] % 1 === 0) {
              harvest(words[2], words[3])
              } else {
                console.log('this needs to be an integer!')
              }
            } else {
              console.log('meow')
              harvest(words[2], 1)
            }
        }

        
      
        if (words[1] == 'deposit') {
          console.log(words[2])
          if (words[3]) {
            if (words[3] % 1 === 0) {
            depositItem(words[2], words[3])
            } else {
              console.log('this needs to be an integer!')
            }
          } else {
            console.log('meow')
            depositItem(words[2], 1)
          }
      }
      if (words[1] == 'withdraw') {
        console.log(words[2])
        if (words[3]) {
          if (words[3] % 1 === 0) {
          withdrawItem(words[2], words[3])
          } else {
            console.log('this needs to be an integer!')
          }
        } else {
          console.log('meow')
          withdrawItem(words[2], 1)
        }
    }
    if (words[1] == 'click') {
      console.log(words[2])
      clickitem = words[2]
      sendMessage(channelId, `clickitem is now ${clickitem}`)
  }

        if (words[1] == 'craft') {
          console.log(words[2])
          craft(words[2])
      }
    }
    }
  
  setTimeout(() => {
    msg.delete().catch(error => {
        console.error('Error deleting message:', error);
    });
}, 1500);
  }
});


async function sendMessage(channelIdsend, message) {
  try {
      // Fetch the channel by its ID
      const channel = await client.channels.fetch(channelIdsend);
      if (!channel) {
          console.error('Channel not found!');
          return;
      }

      // Send the message to the channel
      await channel.send(message);
  } catch (error) {
      console.error('Error sending message:', error);
  }
}

async function sleepAtNight() {
  if (!bot.time.isDay) {
    const bed = bot.findBlock({
      matching: block => block.name.includes('bed'),
      maxDistance: 10
    });

    if (bed) {
      try {
        await bot.sleep(bed);
        bot.chat("Goodnight everyone!!")
      } catch (err) {
        console.error('Error while sleeping:', err.message);
      }
    } else {
      bot.chat("I'm tired, I need a bed but can't see any.")
    }
  }
}

// Call this periodically, e.g., every tick or minute
setInterval(sleepAtNight, 10000);

async function smeltItems(itemToSmelt, fuelItem, inputQuantity, fuelAmount) {
  const furnaceBlock = bot.findBlock({
    matching: block => block.name === 'furnace',
    maxDistance: 10
  });

  if (furnaceBlock) {
    try {
      const furnace = await bot.openFurnace(furnaceBlock);

      const item = bot.inventory.items().find(item => item.name.includes(itemToSmelt));
      const fuel = bot.inventory.items().find(item => item.name.includes(fuelItem));

      if (item && fuel) {
        // Use the provided input quantity and fuel amount
        const numItems = inputQuantity || item.count; // Use the provided input quantity, or the full count if not specified
        const fuelUsed = fuelAmount || fuel.count; // Use the provided fuel amount, or the full fuel count if not specified

        // Calculate the number of items being smelted and adjust the timeout accordingly
        const smeltTimePerItem = 10750; // 10 seconds per item
        const totalSmeltTime = numItems * smeltTimePerItem;

        await furnace.putFuel(fuel.type, null, fuelUsed); // Add specified amount of fuel
        setTimeout(() => {
          furnace.putInput(item.type, null, numItems); // Add the specified quantity of items to smelt
        }, 500)
        
        console.log(`Started smelting ${item.name} with ${numItems} items and ${fuelUsed} fuel.`);

        furnace.on('close', () => {
          console.log('Furnace closed.');
        });

        // Adjust the timeout based on the number of items
        setTimeout(() => {
          furnace.takeOutput(); // Take the output from the furnace
          bot.chat("I should've taken everything out of the furnace by now!")
          setTimeout(() => {
          furnace.close(); // Close the furnace after smelting
          }, 1000)
        }, totalSmeltTime); // Wait for the total smelting time
      } else {
        console.log('Required item or fuel not found in inventory.');
      }
    } catch (err) {
      console.error('Error while smelting:', err.message);
    }
  } else {
    console.log('No furnace found nearby!');
  }
}



function dropItem(itemName, quantity) {
  try {
      const player = bot.nearestEntity(entity => entity.type === 'player'); // Find the nearest player
      if (!player) {
          bot.chat("No player nearby to drop items for.");
          return;
      }

      // Check if the item exists in the bot's inventory
      const item = bot.inventory.items().find(i => i.name === itemName);
      if (!item) {
          bot.chat(`I don't have any ${itemName}.`);
          return;
      }

      // Adjust quantity for "all"
      if (quantity === "all") {
          quantity = item.count;
      }

      // Check if the bot has enough of the item
      if (item.count < quantity) {
          bot.chat(`I only have ${item.count} of ${itemName}, not ${quantity}.`);
          return;
      }

      // Try to toss the item
      bot.toss(item.type, null, quantity, (err) => {
          if (err) {
              bot.chat(`Failed to drop ${quantity} ${itemName}.`);
              console.error("Error during item toss:", err);
          } else {
              bot.chat(`Dropped ${quantity} ${itemName}.`);
          }
      });
  } catch (error) {
      // Catch any unexpected errors and log them
      bot.chat("An error occurred while trying to drop the item.");
      console.error("Unexpected error in dropItem:", error);
  }
}


bot.on('chat', async (username, message) => {
  if (message.includes('dumdumAI')) {  // Check if 'dumdumAI' is mentioned in the chat
    if (username == minecraftUsername) return;
    console.log(`User ${username} said: ${message}`);
    let loc = bot.entity.position;
    let coords = `${loc.x} ${loc.y} ${loc.z}`;
    const response = await getChatGPTResponse(message, username, coords);
    bot.chat(response);
    speak(response);
  }

  // Handle goal command
  if (message.includes('!goal')) {  
    if (username !== minecraftUsername) return;

    // Split commands by "* " to separate them
    let commands = message.split("* ").slice(1);  // Skip the initial part of the message ('!goal')
    
    // Ensure even a single command works by passing it into the goal function
    await goal(commands);
  }
});

// Goal function to handle multiple commands or a single command
async function goal(listOfCommands) {
  for (let i = 0; i < listOfCommands.length; i++) {
    const command = listOfCommands[i].trim(); // Trim spaces to avoid issues with command parsing
    console.log(`Processing command: ${command}`);

    if (command.includes('!goto')) {
      let playerToGo = command.split(": ")[1];
      await come(playerToGo, "player");
    }

    if (command.includes('!fight')) {
      let playerToFight = command.split(": ")[1];
      await come(playerToFight, "fight");
    }

    if (command.includes('!follow')) {
      let playerToFollow = command.split(": ")[1];
      followPlayer = playerToFollow;
    }

    if (command.includes('!coords')) {
      let coords = command.split(": ")[1];
      console.log(`Going to coords: ${coords}`);
      await come(coords, "coords");
    }

    if (command.includes('!place')) {
      let placeStuff = command.split(": ");
      await placeBlock(placeStuff[1], placeStuff[2], placeStuff[3], placeStuff[4]);
    }

    if (command.includes('!wall')) {
      try {
        let wallDetails = command.split(": ");
        let blockType = wallDetails[1];
        let startX = parseInt(wallDetails[2], 10);
        let startY = parseInt(wallDetails[3], 10);
        let startZ = parseInt(wallDetails[4], 10);
        let length = parseInt(wallDetails[5], 10);
        let height = parseInt(wallDetails[6], 10);
        let direction = wallDetails[7].trim(); // "x" or "z"
        await buildWall(blockType, startX, startY, startZ, length, height, direction);
      } catch (err) {
        console.error(`Error processing !wall command: ${err.message}`);
      }
    }

    if (command.includes('!give')) {
      let itemToGive = command.split(": ");
      await dropItem(itemToGive[1], itemToGive[2]);
    }

    if (command.includes('!craft')) {
      let itemToCraft = command.split(": ")[1];
      await craft(itemToCraft);
    }

    if (command.includes('!harvest')) {
      let itemToHarvest = command.split(": ");
      await harvest(itemToHarvest[1], itemToHarvest[2]);
    }

    if (command.includes('!smelt')) {
      let smeltingInfo = command.split(": ");
      await smeltItems(smeltingInfo[1], smeltingInfo[2], smeltingInfo[3], smeltingInfo[4]);
    }

    if (command.includes('!kill')) {
      let mobToKill = command.split(": ")[1];
      await come(mobToKill, "mob");
    }

    console.log(`Finished processing: ${command}`);
  }
}


async function placeBlock(blockType, x, y, z) {
  try {
    const position = new Vec3(x, y, z);

    // Check if the bot has the block type in its inventory
    const blockItem = bot.inventory.items().find(item => item.name === blockType);
    if (!blockItem) {
      console.log(`You don't have ${blockType} in your inventory.`);
      return;
    }

    // Equip the block to the bot's hand
    await bot.equip(blockItem, 'hand');
    console.log(`Equipped ${blockType} to place.`);

    // Calculate the distance to the target position
    const distance = bot.entity.position.distanceTo(position);
    if (distance > 3) { // If the bot is too far away from the target
      console.log(`Bot is too far away. Moving to position ${x}, ${y}, ${z}`);

      // Setup pathfinding movements
      const movements = new Movements(bot, mcData); // Replace `mcData` with your instance
      bot.pathfinder.setMovements(movements);
      const goal = new GoalNear(x + 1, y, z, 3); // Move to within 1 block of target

      // Move the bot to the target position
      await new Promise((resolve, reject) => {
        bot.pathfinder.setGoal(goal);
        bot.once('goal_reached', resolve);
        bot.once('path_stop', reject);
      });
    }

    // Get the reference block at the target position
    const referenceBlock = bot.blockAt(position); // This should be the block at the target position

    // Check if referenceBlock is valid
    if (!referenceBlock) {
      console.log('Target position is not valid for placing a block.');
      return;
    }

    // Place the block with a custom timeout, ensuring enough time for event firing
    await bot.placeBlock(referenceBlock, new Vec3(0, 1, 0));

    console.log(`Placed ${blockType} at ${x}, ${y}, ${z}`);

    // Use setTimeout to allow more time for block update event
    setTimeout(() => {
      console.log(`Placed block successfully at ${x}, ${y}, ${z}`);
    }, 10000); // 10-second timeout before considering placement a failure

  } catch (err) {
    console.error(`Error placing block: ${err.message}`);
  }
}


async function buildWall(blockType, startX, startY, startZ, length, height, direction) {
  try {
    // Determine direction for wall building
    const dx = direction === 'x' ? 1 : 0; // Wall along x-axis
    const dz = direction === 'z' ? 1 : 0; // Wall along z-axis

    // Loop through each layer of the wall
    for (let y = 0; y < height; y++) {
      for (let i = 0; i < length; i++) {
        const x = startX + i * dx;
        const z = startZ + i * dz;
        const yPos = startY + y;

        // Place block at calculated position
        await placeBlock(blockType, x, yPos, z);
      }
    }

    console.log(`Built wall of ${length}x${height} using ${blockType}.`);
  } catch (err) {
    console.error(`Error building wall: ${err.message}`);
  }
}



// Mock in-memory memory store
let memory = [];
let inventoryData = {};

function updateInventory() {
  inventoryData = {}; // Reset inventory data

  bot.inventory.items().forEach(item => {
    if (!inventoryData[item.name]) {
      inventoryData[item.name] = { displayName: item.displayName, count: 0 };
    }
    inventoryData[item.name].count += item.count;
  });

  console.log("Inventory updated:", inventoryData);
}

setInterval(updateInventory, 10000);

async function getChatGPTResponse(prompt, username, coordinates) {
  try {
    // Add a memory check and truncate older entries if needed
    if (memory.length > 20) { // Example: Limit memory to 20 past interactions
      memory = memory.slice(-20);
    }

    const inventorySummary = Object.keys(inventoryData)
      .map(item => `${inventoryData[item].displayName}: ${inventoryData[item].count}`)
      .join(", ");

    // Append the new system and user messages
    const systemMessage = {
      role: "system",
      content: `
You are a friendly and helpful Minecraft bot named "${minecraftUsername}", roleplaying as if you're in the game. You respond casually and briefly in Minecraft chat style. Your main purpose is to assist players with tasks like exploring, building, and fighting mobs. While you prioritize efficiency in executing tasks, you also engage conversationally, making players feel supported by a companion.

Your coordinates are: ${coordinates}

### Core Responsibilities:
1. **Inventory Check**:
   - Before starting any task, check your inventory to ensure you have all required items, tools, or resources.
   - If something is missing, prioritize gathering or crafting those materials first.
   - Your Inventory: ${inventorySummary}

2. **Task Execution**:
   - Complete tasks step-by-step in **sequential order**. Never skip steps, even for intermediate actions like crafting or smelting.
   - Example: To craft an iron pickaxe without materials:
     1. Gather iron ore and wood.
     2. Smelt iron ore and craft sticks.
     3. Craft the pickaxe.

3. **Roleplay Engagement**:
   - Act as a logical yet personable companion. Respond with commands while maintaining a friendly, engaging tone.
   - Balance task execution with brief, conversational comments to enhance the player’s experience.

4. **Command Formatting**:
   - Start each task with "!goal", listing actions in order using "*" separators.
   - Example: To craft an iron pickaxe:
     "!goal* !harvest: iron_ore: 3* !craft: stick: 2* !smelt: iron_ore: 3: coal: 2* !craft: iron_pickaxe"

### Available Commands:
- "!goal* !goto: username": Move to a player.
- "!goal* !follow: username": Follow a player ("!follow: off" to stop).
- "!goal* !fight: username": Engage in combat with a player.
- "!goal* !kill: mobName": Attack a specific mob (e.g., "sheep").
- "!goal* !coords: x: y: z": Move to specified coordinates.
- "!goal* !give: item: quantity": Give items to players (e.g., "oak_log").
- "!goal* !harvest: item: quantity": Gather resources (e.g., "oak_log").
- "!goal* !craft: item": Craft an item (e.g., "stick").
- "!goal* !smelt: item: fuel: quantity": Smelt items if a furnace is nearby (e.g., "!smelt: iron_ore: coal: 5").
- "!goal* !place: blockType: x: y: z": Place blocks at coordinates.
- "!goal* !wall: blockType: startX: startY: startZ: length: height: direction": Build walls (directions: "x" or "z").

### Wall Building:
- Use "!wall" for larger structures like houses or forts, enabling efficient multi-block placements.
- For modular builds (e.g., a square house), use "!wall" multiple times for each side.

### Example Scenarios:
**Scenario 1: Crafting an Iron Pickaxe**
- **Player**: "Craft an iron pickaxe."
- **Bot**: "Checking inventory... Missing sticks and iron. Let me gather those first!"  
  Response: "!goal* !harvest: iron_ore: 3* !craft: stick: 2* !smelt: iron_ore: 3: coal: 2* !craft: iron_pickaxe"

**Scenario 2: Building a House**
- **Player**: "Build a house."
- **Bot**: "Checking inventory... I need materials! Gathering oak logs and stone first..."  
  Response: "!goal* !harvest: oak_logs: 20* !craft: oak_planks: 40* !harvest: stone: 30* !wall: oak_planks: 10: 64: 10: 5: 3: x* !wall: oak_planks: 10: 64: 15: 5: 3: z* !wall: oak_planks: 15: 64: 15: 5: 3: x* !wall: oak_planks: 15: 64: 10: 5: 3: z"

**Note**: Commands do not have to include "Response" and should not use quotation marks.

Do not use quotation marks in commands.

**IMPORTANT, How to establish a sequence of commands**:
- For goals it can be tricky for you to really establish what actions need to be met to achieve the final action
- Try your hardest up to 95% certainty, with the inventory and items you currently have to establish a sequence of commands that would lead to the final action.
- For example if you want to craft a stone pickaxe yet don't have cobblestone, do not attempt to craft the pickaxe yet harvest the missing materials that are not included in your inventory then craft.
- Also, try to ensure that the tools needed to obtain such resources are also a priority.

### Key Guidelines:
- **Never skip steps**: Always gather, craft, or smelt as needed before advancing.
- **Efficiency**: Use concise actions to avoid cluttering chat or wasting time.
- **Engage**: Balance command execution with friendly, brief interactions.
`,
    };

    const userMessage = {
      role: "user",
      content: `The person who has asked you the question is named ${username}: ${prompt}`,
    };

    // Add messages to memory
    memory.push(systemMessage);
    memory.push(userMessage);

    // Send the updated memory array to the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: memory,
    });

    const assistantResponse = {
      role: "assistant",
      content: response.choices[0].message.content.trim(),
    };

    // Add the assistant response to memory
    memory.push(assistantResponse);

    return assistantResponse.content;
  } catch (error) {
    console.error("Error calling OpenAI:", error.message);
    return "Sorry, I couldn't generate a response at the moment.";
  }
}



bot.on('message', async (username, jsonMsg) => {

  const channelIdsend = 'Log Channel id'
  const message = `${username}: ${jsonMsg.toString()}`;
  if(message.includes('chat')) {
    let messagediscord = message.split(": chat")
  await sendMessage(channelIdsend, messagediscord[0]);
  }
});


async function come(username, mob) {
  const defaultMove = new Movements(bot)
  defaultMove.canDig = false
  if (username === bot.username) return


  if (mob == "player") {
   let target = bot.players[username] ? bot.players[username].entity : null

    if (!target) {
      console.log('I don\'t see you !')
      return
    }
    const p = target.position
    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
  }


  if (mob == "fight") {
    
    try {
         target = bot.players[username] ? bot.players[username].entity : null
    console.log(target.name)
    if (!target) {
      console.log("Can't see that mob")
      return
    }
      const p = target.position
      await bot.pathfinder.setMovements(defaultMove)
      await bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
       await bot.pvp.attack(target)
     
      await console.log(`Killed ${username}`)
    } catch (err) {
      // An error occurred, report it.
      console.log(err.message)
      console.log(err)
    }
   
  }

  if (mob == "mob") {
    
    try {
         target = bot.nearestEntity(entity => entity.name.toLowerCase() === username)
    console.log(target.name)
    if (!target) {
      bot.chat(`I cannot see any ${username} nearby!`)
      return
    }
      const p = target.position
      await bot.pathfinder.setMovements(defaultMove)
      await bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 1))
       await bot.pvp.attack(target)
     
    } catch (err) {
      // An error occurred, report it.
      console.log(err.message)
      console.log(err)
    }
   
  }

  
  if (mob == "coords") {
    try {
    let coords = username.split(" ")
    await bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalNear(coords[0], coords[1], coords[2], 1))
  } catch (err) {
    // An error occurred, report it.
    console.log(err.message)
    console.log(err)
  }

  }

}

setInterval(() => {
  if (target != null) {
  console.log(target.username)}
}, 1000)

setInterval(() => {
  if(followPlayer != "off") {
    console.log(followPlayer)
    come(followPlayer, "player")
  }
}, 1000)

let harvestfunction = false;

async function harvest(blockname, times) {
    try {
        let blockType;

        if (blockname === 'cobblestone') {
            blockType = mcData.blocksByName.stone;
        } else {
            blockType = mcData.blocksByName[blockname];
        }

        if (!blockType) {
            console.log(`I don't know any blocks named ${blockname}.`);
            return;
        }

        // Determine if a specific tool is required
        const requiredTool = blockType.harvestTools
            ? bot.inventory.items().find(item => blockType.harvestTools[item.type])
            : null;

        if (requiredTool) {
            await bot.equip(requiredTool, 'hand');
            console.log(`Equipped tool: ${requiredTool.name}`);
        } else if (blockType.harvestTools) {
            console.log(blockType.harvestTools)
            bot.chat(`I need a specific tool to mine ${blockname}, but I don't have one.`);
            return;
        }

        for (let i = 0; i < times; i++) {
            console.log(`Harvesting ${blockname}, iteration ${i + 1} of ${times}`);

            // Find the closest block of the specified type
            const block = bot.findBlock({
                matching: blockType.id,
                maxDistance: 1000,
            });

            if (!block) {
                console.log(`No ${blockname} blocks found nearby.`);
                return;
            }

            const distance = bot.entity.position.distanceTo(block.position);
            const movements = new Movements(bot, mcData);
            bot.pathfinder.setMovements(movements);

            // Move to the block if it's far away
            if (distance > 3) {
                console.log('Distance to block:', distance);
                const { x, y, z } = block.position;
                bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));

                // Wait for the bot to reach the block
                await new Promise((resolve, reject) => {
                    bot.once('goal_reached', resolve);
                    bot.once('path_update', (results) => {
                        if (results.status === 'noPath') {
                            reject(new Error('No path to block!'));
                        }
                    });
                    bot.once('path_stop', (reason) => reject(new Error(`Path stopped: ${reason}`)));
                });
            }

            // Dig and collect the block
            try {
                console.log('Mining block');
                await bot.dig(block);
                await bot.collectBlock.collect(block);
                console.log(`Successfully mined ${blockname}`);
            } catch (err) {
                console.error(`Error during mining: ${err.message}`);
            }
        }
        bot.chat("!done")
    } catch (err) {
        console.error(`Harvest error: ${err.message}`);
    } finally {
        harvestfunction = false;
    }
}

// Set of food item names (you can expand this as needed)
const foodItems = new Set([
  'apple',
  'bread',
  'beef',
  'chicken',
  'mutton',
  'porkchop',
  'potato',
  'carrot',
  'melon_slice',
  'cookie',
  'baked_potato',
  'pumpkin_pie',
  'rabbit_stew',
  'beetroot_soup',
  'golden_apple',
  'golden_carrot'
]);

async function checkAndEat() {
  if (bot.food < 18) { // Trigger eating when hunger drops below 18 (9 drumsticks)
    // Find a consumable item in the bot's inventory
    bot.chat("I'm Hungry!")
    const foodItem = bot.inventory.items().find(item => foodItems.has(item.name));

    if (foodItem) {
      try {
        await bot.equip(foodItem, 'hand'); // Equip the food item
        await bot.consume(); // Consume the food item
        bot.chat(`I ate ${foodItem.displayName} to restore hunger.`);
      } catch (err) {
        console.error('Error while eating food:', err.message);
      }
    } else {
      console.log('No consumable food available in inventory!');
    }
  }
}

// Call periodically or trigger with an event
setInterval(checkAndEat, 10000); // Check every 10 seconds


let craftingitem = null

async function craft(item) {

  if (harvestfunction == false) {
  

  const craftingtable = bot.findBlock({
    matching: bot.registry.blocksByName.crafting_table.id,
    maxDistance: 50,
})
try {
  const itemID = bot.registry.itemsByName[item].id
  if (craftingitem == null) {
    craftingitem = item
  }
if (craftingtable && craftingitem !== null) {
  
  const distance = bot.entity.position.distanceTo(craftingtable.position)
console.log(craftingitem)
    if (distance > 3) {
      
  const movements = new Movements(bot, mcData)
  await bot.pathfinder.setMovements(movements)

console.log('Distance:',distance)
const x = craftingtable.position.x
const y = craftingtable.position.y + 1
const z = craftingtable.position.z
const goal = new GoalBlock(x, y, z)
await bot.pathfinder.setGoal(new GoalNear(x, y, z, 1))
await console.log('found table')
    }
bot.once('goal_reached', async (goal) => {
      await craft(craftingitem)
      console.log('goal reached')
      return
      })
  const recipe = bot.recipesAll(itemID, null, 1, null)[0]
  
  if (typeof recipe !== 'undefined') {
    console.log(recipe)
    var n = 1
    for (var i = 0; i < recipe.delta.length; i++){
      let recipeItemId = recipe.delta[i].id
      let recipeItemNum = (recipe.delta[i].count*-1)
    if (recipe.delta[i].metadata === null) {
      console.log(recipe.delta[i].id)
    const iteminv = bot.inventory.findInventoryItem(recipeItemId)
    if (iteminv) {
      console.log(`${iteminv} is here`)
      const itemnum = bot.inventory.findInventoryItem(recipeItemId).count
      console.log(recipeItemNum)
      if (recipeItemNum <= itemnum) {
    n++
  console.log(n)
      if (n == recipe.delta.length) {

        try {
          console.log('enough')
        console.log(craftingtable)
        await bot.craft(recipe, 1, craftingtable)
            console.log(recipe)
         await console.log(`Crafted: ${item}`)
         if (item == craftingitem) {
          craftingitem = null
          bot.chat("!done")
          return
         }
         return
        } catch (error) {
          console.log('error5')
          console.log(error)
          

      }
      }
    } else {
        console.log(`not enough of ${bot.inventory.findInventoryItem(recipeItemId).name}`)
        await craft(bot.inventory.findInventoryItem(recipeItemId).name)
        await craft(craftingitem)
      }
    } else { 
      console.log(`I don't have ${bot.registry.items[recipeItemId].name}`)
      await craft(bot.registry.items[recipeItemId].name) 
      await craft(craftingitem)
  }
    }

  }
} else {
  console.log(bot.registry.itemsByName[item]);
  harvestfunction = true
    await harvest(bot.registry.itemsByName[item].name, 1); // Wait for harvesting to finish
    await craft(craftingitem); // Then start crafting

    return;
}} else {
  await craftthetable()
  await craft(craftingitem)
}} catch (err) {
  console.log(`error `)
  console.log(err)
} 

}}


async function craftthetable() {
  console.log("I don't see a crafting table")
  const craftingtableinv = bot.inventory.items().find(item => item.name.includes("crafting_table"))
    if (craftingtableinv) {
      try {
      await bot.equip(craftingtableinv, 'hand')
      await bot.placeBlock(bot.blockAt(bot.entity.position.offset(1, 0, 0)), new Vec3(0, 1, 0))
      } catch (err) {if (err.message.includes('Event') && err.message.includes('did not fire within timeout')) {
        console.log('Timeout error occured.');
      } else {
        console.log(err);}
      }
    } else {
      const planks = bot.inventory.items().find(item => item.name.includes("planks"))
      if (planks) {

        const craftingTableID = bot.registry.itemsByName.crafting_table.id
        const recipe = bot.recipesAll(craftingTableID, null, 1, null)[0]
        console.log('CRAFTING TABLE ID:', craftingTableID)
        console.log(recipe)
        const planksnum = (recipe.delta[0].count*-1)
        console.log(planksnum)
        const planksinv = bot.inventory.findInventoryItem(recipe.delta[0].id).count
        console.log(planksinv)
        if (recipe) {
          if (planksnum <= planksinv) {
        try {
          await bot.craft(recipe, 1, null)  
          
            console.log(`YAY`)
            await craftthetable()
        ;
        } catch (err) {
          console.log(`error `)
      }} else {
        console.log('Not enough planks!')
        const logs = bot.inventory.items().find(item => item.name.includes("log"))
      if(logs) {
        let logType = logs.name.split("_")
let plankType = logType[0] + '_planks'
      console.log(logType[0])
      console.log(plankType)
      const plankID = bot.registry.itemsByName[plankType].id
      console.log(plankID)
      const recipe = bot.recipesFor(plankID, null, 1, null)[0]
      if (recipe) {
        try {
          await bot.craft(recipe, 1, null)  
          
            console.log(`YAY`)
           await craftthetable()
        ;
        } catch (err) {
          console.log(`error `)
      }}
      } else {
        console.log('no log')
        await harvest('oak_log', 1)
        await craftthetable()
        return
      }
      }
      
    }
    } else {
      const logs = bot.inventory.items().find(item => item.name.includes("log"))
      console.log('logs')
      if(logs) {
        let logType = logs.name.split("_")
let plankType = logType[0] + '_planks'
      console.log(logType[0])
      console.log(plankType)
      const plankID = bot.registry.itemsByName[plankType].id
      console.log(plankID)
      const recipe = bot.recipesFor(plankID, null, 1, null)[0]
      if (recipe) {
        try {
          await bot.craft(recipe, 1, null)  
          
            console.log(`YAY`)
            await craftthetable()
        ;
        } catch (err) {
          console.log(`error `)
      }}
      } else {
        
        await harvest('oak_log', 1)
        await console.log('here')
      }
    }
    }
}


client.login(`${discordAuthToken}`);


bot.on('entityHurt', async (entity) => {
  if (entity.type === 'player' && entity.username === bot.username) {

      if (bot.health > healthnum) {
        const sword = bot.inventory.items().find(item => item.name.includes(weapon));
        if (sword) {
          await bot.equip(sword, 'hand');
        }
        const target = bot.nearestEntity(({ type }) => type === 'mob' || type === 'player');
        if (target) {
          bot.pvp.attack(target);
        }
      }
    }})


    

function walkRandomly() {
  const x = Math.floor(Math.random() * 41) - 20; // Random number between -10 and 10
  const z = Math.floor(Math.random() * 41) - 20;
  const targetPos = bot.entity.position.offset(x, 0, z);
  const defaultMove = new Movements(bot)
      defaultMove.canDig = false
  bot.pathfinder.setGoal(new goals.GoalBlock(targetPos.x, targetPos.y, targetPos.z));
}

// Check if the bot is moving
function isBotMoving() {
  return bot.entity.velocity.x !== 0 
}

// Function to start walking idly if the bot is not moving
function idleWalk() {
  if(idle == true) {
  if (!isBotMoving()) {
   target = null
    walkRandomly();
  }}
}

// Check every 2 seconds if the bot is not moving and start walking idly
setInterval(idleWalk, 2000);

bot.on('message', async (jsonMsg) => {
  
  if(jsonMsg.toString().includes("inventory")) {
    const items = bot.inventory.items()
    for (var i = 0; i < items.length; i++) {
    console.log(`Inventory Slot ${i}: ${items[i].name}`)
    }
  }
  if(jsonMsg.toString().includes("xxx")) {

    craftthetable()
    
  }
  })
  

  function useFishingRod() {
    if (target && bot.inventory.items().find(item => item.name.includes("fishing"))) {
      const rod = bot.inventory.items().find(item => item.name.includes("fishing"))
      if (rod) {
        bot.equip(rod, 'hand')
          
            bot.activateItem();
            setTimeout(() => {
              // Switch back to the main weapon after using the fishing rod
              const sword = bot.inventory.items().find(item => item.name.includes(weapon)); // Change 'diamond_sword' to your main weapon name
              if (sword) {
                bot.equip(sword, 'hand', (err) => {
                  if (err) {
                    console.error(err);
                  }
                });
              }
            }, 500); // Adjust the delay to simulate the rod usage time
          }
        ;
    }
  }

  setInterval(() => {
    if (target) {
      if(idle == false) {
      useFishingRod();
      }
    }
    
  }, 1300);

  


  async function withdrawItem (name, amount) {
    const item = bot.registry.itemsByName[name].id
    const item2 = mcData.itemsByName[name]
    console.log(item)
    console.log(item2)
    if (item) {
      try {
        
        await window.withdraw(item2.id, null, amount)
        console.log(`withdrew ${amount} ${item}`)
      } catch (err) {
        console.log(`unable to withdraw ${amount} ${item}`)
      }
    } else {
      console.log(`unknown item ${name}`)
    }
  }

  async function depositItem (name, amount) {
    const item = mcData.itemsByName[name]
    if (item) {
      try {
        await window.deposit(item.id, null, amount)
        console.log(`deposited ${amount} ${item.displayName}`)
      } catch (err) {
        console.log(`unable to deposit ${amount} ${item.displayName}`)
      }
    } else {
      console.log(`unknown item ${name}`)
    }
  }


// Event listener for bot ready
bot.on('spawn', () => {
  console.log(`Bot ${bot.username} spawned.`);
 
});

// Event listener for bot error
bot.on('error', (err) => {
  console.error('Bot error:', err);
});
