import { ScoreboardData } from "@/lib/api/types";

// Mock data exported for both API route and direct import in development
export const mockScoreboardData: ScoreboardData = {
  factions: [
    // Imperium Factions (alphabetically ordered)
    { id: "adepta-sororitas", name: "Adepta Sororitas", superfaction: "imperium" },
    { id: "adeptus-custodes", name: "Adeptus Custodes", superfaction: "imperium" },
    { id: "adeptus-mechanicus", name: "Adeptus Mechanicus", superfaction: "imperium" },
    { id: "astra-militarum", name: "Astra Militarum", superfaction: "imperium" },
    { id: "grey-knights", name: "Grey Knights", superfaction: "imperium" },
    { id: "imperial-knights", name: "Imperial Knights", superfaction: "imperium" },
    { id: "space-marines", name: "Space Marines", superfaction: "imperium" },
    
    // Chaos Factions (alphabetically ordered)
    { id: "chaos-daemons", name: "Chaos Daemons", superfaction: "chaos" },
    { id: "chaos-knights", name: "Chaos Knights", superfaction: "chaos" },
    { id: "chaos-space-marines", name: "Chaos Space Marines", superfaction: "chaos" },
    { id: "death-guard", name: "Death Guard", superfaction: "chaos" },
    { id: "thousand-sons", name: "Thousand Sons", superfaction: "chaos" },
    { id: "world-eaters", name: "World Eaters", superfaction: "chaos" },
    
    // Xenos Factions (alphabetically ordered)
    { id: "aeldari", name: "Aeldari", superfaction: "xenos" },
    { id: "drukhari", name: "Drukhari", superfaction: "xenos" },
    { id: "genestealer-cults", name: "Genestealer Cults", superfaction: "xenos" },
    { id: "leagues-of-votann", name: "Leagues of Votann", superfaction: "xenos" },
    { id: "necrons", name: "Necrons", superfaction: "xenos" },
    { id: "orks", name: "Orks", superfaction: "xenos" },
    { id: "tau-empire", name: "T'au Empire", superfaction: "xenos" },
    { id: "tyranids", name: "Tyranids", superfaction: "xenos" }
  ],
  
  missions: [
    { 
      id: "secure-missing-artifacts",
      name: "Secure Missing Artifacts", 
      description: "Capture and hold strategic objectives to recover valuable relics.",
      terrainLayout: "urban-ruins"
    },
    { 
      id: "take-and-hold",
      name: "Take and Hold", 
      description: "Control critical locations on the battlefield.",
      terrainLayout: "industrial-zone"
    },
    { 
      id: "priority-target",
      name: "Priority Target", 
      description: "Eliminate high-value targets while maintaining battlefield control.",
      terrainLayout: "wilderness"
    },
    { 
      id: "scorched-earth",
      name: "Scorched Earth", 
      description: "Destroy enemy infrastructure while preserving your own.",
      terrainLayout: "devastated-cityscape"
    }
  ],
  
  terrainLayouts: {
    "urban-ruins": "Dense city ruins with multiple levels and line-of-sight blocking terrain",
    "industrial-zone": "Factory setting with large structures, pipes, and storage containers",
    "wilderness": "Natural landscape with hills, forests, and limited cover",
    "devastated-cityscape": "Partially collapsed buildings and rubble-strewn streets"
  },
  
  secondaries: [
    { 
      id: "behind-enemy-lines", 
      name: "Behind Enemy Lines", 
      description: "Score 3 victory points each time a unit from your army successfully completes the following action: Behind Enemy Lines. A unit can perform this action if all of its models are wholly within the enemy deployment zone. This action cannot be performed by Aircraft.",
      shortDescription: "Unit performs action in enemy deployment zone",
      category: "Battlefield Supremacy",
      pointsPerCompletion: 3,
      maxCompletions: 2
    },
    { 
      id: "bring-it-down", 
      name: "Bring It Down", 
      description: "Score 2 victory points each time an enemy MONSTER or VEHICLE model with a Wounds characteristic of 10 or less is destroyed. Score 3 victory points for each enemy MONSTER or VEHICLE model with a Wounds characteristic of 11 or more that is destroyed.",
      shortDescription: "Destroy enemy MONSTERS and VEHICLES",
      category: "No Mercy, No Respite",
      pointsPerCompletion: 2,
      maxCompletions: 3
    },
    { 
      id: "deploy-teleport-homer", 
      name: "Deploy Teleport Homer", 
      description: "Score 2 victory points each time a unit from your army successfully completes the following action: Deploy Teleport Homer. A unit can start to perform this action at the end of your Movement phase if it is wholly within 6\" of the center of the battlefield and no enemy units are wholly within 6\" of the center of the battlefield.",
      shortDescription: "Unit performs action near battlefield center",
      category: "Shadow Operations",
      pointsPerCompletion: 2,
      maxCompletions: 4
    },
    { 
      id: "engage-on-all-fronts", 
      name: "Engage on All Fronts", 
      description: "Score 2 victory points if you have one or more units from your army wholly within three different table quarters, and those units are all more than 6\" away from the center of the battlefield. Score 3 victory points instead if you have one or more units from your army wholly within each table quarter, and those units are all more than 6\" away from the center of the battlefield.",
      shortDescription: "Have units in 3+ table quarters away from center",
      category: "Battlefield Supremacy",
      pointsPerCompletion: 3,
      maxCompletions: 1
    },
    { 
      id: "retrieve-nephilim-data", 
      name: "Retrieve Nephilim Data", 
      description: "Score 3 victory points each time a unit from your army successfully completes the following action: Retrieve Nephilim Data. A unit can perform this action if it is within 6\" of the center of a battlefield quarter that you have not already retrieved the Nephilim data from.",
      shortDescription: "Unit performs action in each battlefield quarter",
      category: "Shadow Operations",
      pointsPerCompletion: 3,
      maxCompletions: 4
    }
  ],
  
  primaryObjectives: [
    {
      id: "take-and-hold",
      name: "Take and Hold",
      description: "Control objective markers to score victory points at the end of your Command phase. Score 4 points for holding 2 objectives, 8 points for holding 3 objectives, 10 points for holding more objectives than your opponent, and 12 points for holding all objectives.",
      pointsPerTurn: [5, 5, 10, 10, 12]
    },
    {
      id: "purge-the-foe",
      name: "Purge the Foe",
      description: "Destroy enemy units to score victory points at the end of the battle round. Score 3 points for destroying 2 enemy units, 7 points for destroying 3 enemy units, 10 points for destroying more enemy units than your opponent lost, and 15 points for destroying 6+ enemy units.",
      pointsPerTurn: [3, 7, 7, 10, 15]
    },
    {
      id: "no-prisoners",
      name: "No Prisoners",
      description: "Score victory points for each enemy model slain during the battle. 1 point per 10 models destroyed, up to a maximum that increases with each battle round.",
      pointsPerTurn: [5, 5, 10, 12, 15]
    }
  ]
};
