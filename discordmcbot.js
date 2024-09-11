const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3'); 
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const goals = require('mineflayer-pathfinder').goals
const { GoalNear } = require('mineflayer-pathfinder').goals
const collectBlock = require('mineflayer-collectblock').plugin
const pvp = require('mineflayer-pvp').plugin
const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock

const discordAuthToken = 'PUT AUTH TOKEN HERE';
const channelId = 'PUT CHANNEL ID FOR SENDING COMMANDS HERE';
const minecraftUsername = 'PUT MC USERNAME HERE';
const minecraftServerHost = 'hypixel.net';
const minecraftServerPort = '25565';
const channelIDToSend = 'PUT CHANNEL FOR LOGS HERE'
const mcauth = 'microsoft';
const mcversion = '1.16.5'

const healthnum = 9
var eatagain = true

const moveAwayDuration = 5000; 
let isMovingAway = false;
let botwalk = false
var autopvp = false

// Initialize Mineflayer bot
const bot = mineflayer.createBot({
  username: minecraftUsername,
  host: minecraftServerHost,
  auth: 'microsoft',
  version: '1.16.5'
});

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)
bot.loadPlugin(collectBlock)


client.once('ready', () => {
  console.log('Bot is ready!');
});

let mcData
bot.once('spawn', () => {
  mcData = require('minecraft-data')(bot.version)
})

client.on('messageCreate', (msg) => {
   
  
  if (msg.channelId === channelId) {
    var recentmsg = msg.content

    if (recentmsg == 'start walking') {
      bot.setControlState('forward', true)
      botwalk = true
    }
    if (recentmsg == 'stop walking') {
      bot.setControlState('forward', false)
      botwalk = false
    }
    if (recentmsg == 'leave') {
      bot.quit()
      
    }

    if (recentmsg.includes('join ') == true) {
      let server = recentmsg.split(" ")
      const bot = mineflayer.createBot({
        username: minecraftUsername,
        host: minecraftServerPort,
        auth: mcauth,
        version: mcversion
      });
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
        
    if (recentmsg.includes('goto') == true) {
      
        let words = recentmsg.split(" ")
        if (words[1] == 'player') {
        console.log(words[2])
        come(words[2], "player")
        }
        if (words[1] == 'food') {
          console.log(words[2])
          come(null, "food")
          
          }
          if (words[1] == 'fight') {
            console.log(words[2])
            come(words[2], "fight")
            
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

bot.on('message', async (username, jsonMsg) => {

  const channelIdsend = channelIDToSend;
  const message = `${username}: ${jsonMsg.toString()}`;
  if(message.includes('chat')) {
    let messagediscord = message.split(": chat")
  await sendMessage(channelIdsend, messagediscord[0]);
  }
});

async function come(username, mob) {
  const defaultMove = new Movements(bot)
  bot.canDigBlock = false
  if (username === bot.username) return


  if (mob == "player") {
  const target = bot.players[username] ? bot.players[username].entity : null

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
        const target = bot.players[username] ? bot.players[username].entity : null
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

      console.log(err.message)
      console.log(err)
    }
  }
}

let harvestfunction = false;

async function harvest(blockname, times) {
  try {
  let blockType;
  console.log(times)
  if (blockname == 'cobblestone') {
      blockType = mcData.blocksByName.stone;
  } else {
      blockType = mcData.blocksByName[blockname];
  }

if (blockname.includes('stone')) {
  const botpickaxe = bot.inventory.items().find(item => item.name.includes("pickaxe"))
  if (botpickaxe) {
    console.log(botpickaxe)
  }
}

  if (!blockType) {
      console.log(`I don't know any blocks named ${blockname}.`);
      return;
  }

  const blocks = bot.findBlock({
      matching: blockType.id,
      maxDistance: 1000,
  });

  
      console.log('Harvesting');
      const distance = bot.entity.position.distanceTo(blocks.position);
      const movements = new Movements(bot, mcData);
      await bot.pathfinder.setMovements(movements);

      if (distance > 3) {
          console.log('Distance to block:', distance);
          const p = blocks.position;
          await bot.pathfinder.setGoal(new GoalNear(p.x, p.y+1, p.z, 1));

          const goalReached = new Promise((resolve, reject) => {
              bot.once('goal_reached', (goal) => {
                  resolve();
              });
              bot.once('path_stop', (reason) => {
                  reject(new Error(`Path stopped: ${reason}`));
              });
          });

          await goalReached; // Wait for goal to be reached

          if (bot.pathfinder.isMining() || bot.pathfinder.isBuilding()) {
              console.log('Already performing mining/building task. Waiting...');
              await new Promise(resolve => bot.once('goal_reached', resolve)); // Wait for current task to finish
          }

          console.log('Mining');
          try {
          await bot.dig(blocks);
          await bot.collectBlock.collect(blocks); // Collect the mined block
          console.log('Done mining');
          if (times > 1) {
            times = (times-1)
            await console.log(`Need to harvest ${blockname} ${times} more times!`)
            await harvest(blockname, times)
          }
          harvestfunction = false
        } catch (err) {
          console.log('Error during harvest: ' + err.message);
          console.error(err);
          if (times > 1) {
            times = (times-1)
            await console.log(`Need to harvest ${blockname} ${times} more times!`)
            await harvest(blockname, times)
          }
          harvestfunction = false
      }
      } else {
          console.log('Close enough to mine');
          try {
          await bot.dig(blocks);
          await bot.collectBlock.collect(blocks); // Collect the mined block
          console.log('Done mining');
          if (times > 1) {
            times = (times-1)
            await console.log(`Need to harvest ${blockname} ${times} more times!`)
            await harvest(blockname, times)
          }
          harvestfunction = false
        } catch (err) {
          console.log('Error during harvest: ' + err.message);
          console.error(err);
          if (times > 1) {
            times = (times-1)
            await console.log(`Need to harvest ${blockname} ${times} more times!`)
            await harvest(blockname, times)
          }
          harvestfunction = false
      }
      }
  } catch (err) {
      console.log('Error during harvest: ' + err.message);
      console.error(err);
      if (times > 1) {
        times = (times-1)
        await console.log(`Need to harvest ${blockname} ${times} more times!`)
        await harvest(blockname, times)
      }
      harvestfunction = false
  }
}


async function eat() {
try {
  const food = bot.inventory.items().find(item => item.name.includes("beef")) || bot.inventory.items().find(item => item.name.includes("chicken")) || bot.inventory.items().find(item => item.name.includes("mutton")) || bot.inventory.items().find(item => item.name.includes("pork"))
  if (bot.health <= healthnum) {
  if (food) {
    if (eatagain == true) {
        eatagain = false
    bot.pvp.stop()
    bot.setControlState('back', true)
    const playerFilter = (entity) => entity.type === 'player'
  const playerEntity = bot.nearestEntity(playerFilter)
  const pos = playerEntity.position.offset(0, playerEntity.height, 0)
  bot.lookAt(pos)
    await bot.equip(food, 'hand')
   await bot.activateItem(offhand=false)
   setTimeout(() => {
    eatagain = true
    bot.setControlState('back', false)
    let target = bot.nearestEntity(({ type }) => type === 'player')
   const sword = bot.inventory.items().find(item => item.name.includes("sword"))
   if(sword) {
     bot.equip(sword, 'hand')
   }
     bot.pvp.attack(target)
  }, 2250);
}
   if (bot.health >= healthnum) {
   let target = bot.nearestEntity(({ type }) => type === 'player')
   const sword = bot.inventory.items().find(item => item.name.includes("sword"))
   if(sword) {
    bot.equip(sword, 'hand')
  }
     bot.pvp.attack(target)
   }
   return
  } 
  else {
    come(null, "food")
    return
  }
} } catch (err) {
  console.log(err)
}
}


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
        if(logType !== dark) {
var plankType = logType[0] + '_planks'
        } else {
          var plankType = 'dark_oak_planks'
        }
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

function moveAway() {
  if (!isMovingAway) {
      isMovingAway = true;

      // Stop any previous movement
      bot.clearControlStates();

      // Move away for the specified duration
      bot.setControlState('back', true);
      bot.setControlState('jump', true);
      setTimeout(() => {
          bot.clearControlStates();
          isMovingAway = false;
          if (botwalk == true) {
            bot.setControlState('forward', true)
          }
      }, moveAwayDuration);
      
  }
}

bot.on('entityHurt', async (entity) => {
  if (entity.type === 'player') {
    if (entity.username == bot.username) {
        if (autopvp == true) {
            if (bot.health > healthnum) {
                const sword = bot.inventory.items().find(item => item.name.includes("sword"))
                if(sword) {
                    bot.equip(sword, 'hand')
                  }
            let target = bot.nearestEntity(({ type }) => type === 'player')
            bot.pvp.attack(target)
            }
        }
    }
    }
}
)

bot.on('physicsTick', eat)
bot.on('spawn', () => {
  console.log(`Bot ${bot.username} spawned.`);
 
});
bot.on('error', (err) => {
  console.error('Bot error:', err);
});
