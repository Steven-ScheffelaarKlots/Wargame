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
    { id: "imperial-agents", name: "Imperial Agents", superfaction: "imperium" },
    { id: "imperial-knights", name: "Imperial Knights", superfaction: "imperium" },
    { id: "space-marines", name: "Space Marines", superfaction: "imperium" },
    
    // Chaos Factions (alphabetically ordered)
    { id: "chaos-daemons", name: "Chaos Daemons", superfaction: "chaos" },
    { id: "chaos-knights", name: "Chaos Knights", superfaction: "chaos" },
    { id: "chaos-space-marines", name: "Chaos Space Marines", superfaction: "chaos" },
    { id: "death-guard", name: "Death Guard", superfaction: "chaos" },
    { id: "emperors-children", name: "Emperor's Children", superfaction: "chaos" },
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
      terrainLayout: "urban-ruins",
      primaryMissionId: "take-and-hold",
      isPreset: true
    },
    { 
      id: "take-and-hold",
      name: "Take and Hold", 
      description: "Control critical locations on the battlefield.",
      terrainLayout: "industrial-zone",
      primaryMissionId: "purge-the-foe",
      isPreset: true
    },
    { 
      id: "priority-target",
      name: "Priority Target", 
      description: "Eliminate high-value targets while maintaining battlefield control.",
      terrainLayout: "wilderness",
      primaryMissionId: "domination",
      isPreset: true
    },
    { 
      id: "scorched-earth",
      name: "Scorched Earth", 
      description: "Destroy enemy infrastructure while preserving your own.",
      terrainLayout: "devastated-cityscape",
      primaryMissionId: "take-and-hold",
      isPreset: true
    }
  ],
  
  terrainLayouts: [
    {
      id: "urban-ruins",
      name: "Urban Ruins",
      description: "Dense city ruins with multiple levels and line-of-sight blocking terrain"
    },
    {
      id: "industrial-zone",
      name: "Industrial Zone",
      description: "Factory setting with large structures, pipes, and storage containers"
    },
    {
      id: "wilderness",
      name: "Wilderness",
      description: "Natural landscape with hills, forests, and limited cover"
    },
    {
      id: "devastated-cityscape", 
      name: "Devastated Cityscape",
      description: "Partially collapsed buildings and rubble-strewn streets"
    }
  ],
  
  secondaries: [
    {
      id: "area-denial",
      name: "Area Denial",
      description: "Score 2 victory points if you control more objectives than your opponent at the end of the battle.",
      shortDescription: "Control more objectives than opponent",
      completions: [
        {
          description: "Friendly unit within 3\" of the center and no enemy units within 3\" of the center",
          points: 2
        },
        {
          description: "Friendly unit within 3\" of the center and no enemy units within 6\" of the center",
          points: 5
        }
      ]
    },
    {
      id: "assassination",
      name: "Assassination",
      description: "Score 5 victory points if you kill an enemy character model, or if all enemy character models are destroyed.",
      shortDescription: "Destroy enemy CHARACTER models",
      completions: [
        {
          description: "Destroy 1+ enemy CHARACTER models",
          points: 5
        },
        {
          description: "All enemy character models are destroyed",
          points: 5
        }
      ]
    },
    { 
      id: "behind-enemy-lines", 
      name: "Behind Enemy Lines", 
      description: "Score 3 victory points each time a unit from your army successfully completes the following action: Behind Enemy Lines. A unit can perform this action if all of its models are wholly within the enemy deployment zone. This action cannot be performed by Aircraft.",
      shortDescription: "Unit performs action in enemy deployment zone",
      completions: [
        {
          description: "1 Unit is wholly within the enemy deployment zone",
          points: 3
        },
        {
          description: "2+ Units are wholly within the enemy deployment zone",
          points: 4
        }
      ]
    },
    // { 
    //   id: "bring-it-down", 
    //   name: "Bring It Down", 
    //   description: "Score 2 victory points each time an enemy MONSTER or VEHICLE model with a Wounds characteristic of 10 or less is destroyed. Score 3 victory points for each enemy MONSTER or VEHICLE model with a Wounds characteristic of 11 or more that is destroyed.",
    //   shortDescription: "Destroy enemy MONSTERS and VEHICLES",
    //   pointsPerCompletion: 2,
    //   maxCompletions: 3
    // },
    { 
      id: "cleanse", 
      name: "Cleanse", 
      description: "Score 2 victory points each time a unit from your army successfully completes the following action: Cleanse. A unit can start to perform this action at the end of your Movement phase if it is wholly within 6\" of the center of the battlefield and no enemy units are wholly within 6\" of the center of the battlefield.",
      shortDescription: "Unit performs action near battlefield center",
      completions: [
        {
          description: "Cleansed 1 objective marker",
          points: 2
        },
        {
          description: "Cleansed 2+ objective markers",
          points: 4
        }
      ]
    },
    {
      id: "battlefield-supremacy",
      name: "Battlefield Supremacy",
      description: "Score points for controlling key areas of the battlefield. Score for each condition you fulfill, up to a maximum of 5 points per turn.",
      shortDescription: "Control key areas of the battlefield",
      scoringType: "multiple",
      maxPoints: 5,
      completions: [],
      conditions: [
        {
          id: "center",
          description: "Control the center objective",
          points: 2
        },
        {
          id: "enemy-territory",
          description: "Control an objective in enemy territory",
          points: 2
        },
        {
          id: "all-objectives",
          description: "Control more objectives than your opponent",
          points: 1
        },
        {
          id: "no-man",
          description: "Control objective in no man's land",
          points: 1
        }
      ]
    },
    {
      id: "battlefield-dominance",
      name: "Battlefield Dominance",
      description: "Score points for battlefield dominance and enemy casualties. Score for each condition you fulfill, up to a maximum of 4 points per turn.",
      shortDescription: "Battlefield dominance and enemy casualties",
      scoringType: "multiple",
      maxPoints: 4,
      completions: [],
      conditions: [
        {
          id: "kill-character",
          description: "Destroy an enemy CHARACTER",
          points: 2
        },
        {
          id: "kill-vehicle",
          description: "Destroy an enemy VEHICLE",
          points: 1
        },
        {
          id: "kill-monster",
          description: "Destroy an enemy MONSTER",
          points: 1
        },
        {
          id: "control-relic",
          description: "Control the relic objective",
          points: 2
        }
      ]
    },
    // {
    //   id: "containment",
    //   name: "Containment",
    //   description: "Actions near battlefield edges",
    //   shortDescription: "Actions near battlefield edges",
    //   completions: [
    //     {
    //       description: "1 Unit is wholly within the opponent's deployment zone",
    //       points: 2
    //     },
    //     {
    //       description: "2+ Units are wholly within the opponent's deployment zone",
    //       points: 4
    //     }
    //   ]
    // },
    {
      id: "engage-on-all-fronts",
      name: "Engage on All Fronts", 
      description: "Score 2 victory points if you have one or more units from your army wholly within three different table quarters, and those units are all more than 6\" away from the center of the battlefield. Score 3 victory points instead if you have one or more units from your army wholly within each table quarter, and those units are all more than 6\" away from the center of the battlefield.",
      shortDescription: "Have units in 3+ table quarters away from center",
      completions: [{
        description: "Units wholly within 3 table quarters",
        points: 2
      },
      {
        description: "Units wholly within 4 table quarters",
        points: 4
      }]
    },
    {
      id: "no-prisoners",
      name: "No Prisoners",
      description: "Score victory points for each enemy model slain during the battle. 1 point per 10 models destroyed, up to a maximum that increases with each battle round.",
      shortDescription: "Kill enemy models for points",
      completions: [
        { 
          description: "Destroyed 1 enemy unit",
          points: 2
        },
        {
          description: "Destroyed 2 enemy units",
          points: 4
        },
        {
          description: "Destroyed 3+ enemy units",
          points: 5
        }
      ]
    },
    {
      id: "bring-it-down",
      name: "Bring It Down",
      description: "Score victory points each time an enemy MONSTER or VEHICLE model is destroyed. Score points based on the Wounds characteristic of the destroyed model.",
      shortDescription: "Destroy enemy MONSTERS and VEHICLES",
      scoringType: "counter",
      maxPoints: 15,
      completions: [],
      conditions: [
        {
          id: "small-vehicle",
          description: "Destroy MONSTER/VEHICLE with Wounds 1-9",
          points: 1
        },
        {
          id: "medium-vehicle",
          description: "Destroy MONSTER/VEHICLE with Wounds 10-14",
          points: 2
        },
        {
          id: "large-vehicle",
          description: "Destroy MONSTER/VEHICLE with Wounds 15+",
          points: 3
        }
      ]
    },
    {
      id: "recover-assets",
      name: "Recover Assets",
      description: "Score 2 victory points each time a unit from your army successfully completes the following action: Recover Assets. A unit can perform this action if it is within 6\" of a battlefield edge that you control.",
      shortDescription: "Unit performs action near controlled battlefield edge",
      completions: [{
        description: "2 units recovered assets",
        points: 3
      },
      {
        description: "3+ units recovered assets",
        points: 6
      }]
    },
    {
      id: "secure-no-mans",
      name: "Secure No Man's Land",
      description: "Score 2 victory points each time a unit from your army successfully completes the following action: Secure No Man's Land. A unit can perform this action if it is within 6\" of the center of the battlefield and no enemy units are wholly within 6\" of the center of the battlefield.",
      shortDescription: "Unit performs action near battlefield center",
      completions: [{
        description: "Control 1 objective in No Man's Land",
        points: 2
      },
      {
        description: "Control 2+ objectives in No Man's Land",
        points: 5
      }]
    },
    {
      id: "warp-ritual",
      name: "Warp Ritual",
      description: "Score victory points each time a PSYKER unit from your army successfully completes the following psychic action: Warp Ritual. Score more points for each subsequent ritual completed.",
      shortDescription: "Perform Warp Ritual psychic actions",
      scoringType: "counter",
      maxPoints: 12,
      completions: [],
      conditions: [
        {
          id: "first-ritual",
          description: "Complete first Warp Ritual",
          points: 3
        },
        {
          id: "second-ritual",
          description: "Complete second Warp Ritual",
          points: 4
        },
        {
          id: "third-ritual",
          description: "Complete third Warp Ritual",
          points: 5
        }
      ]
    }
  ],
  
  primaryMissions: [
    {
      id: "take-and-hold",
      name: "Take and Hold",
      description: "Control objective markers to score victory points at the end of your Command phase.",
      maxPointsPerTurn: [10, 10, 12, 12, 15],
      objectives: [
        {
          id: "hold-one",
          description: "Control 1+ objective markers",
          points: 2,
          availableInTurns: [1, 2, 3, 4, 5]
        },
        {
          id: "hold-two",
          description: "Control 2+ objective markers",
          points: 3,
          availableInTurns: [1, 2, 3, 4, 5]
        },
        {
          id: "hold-three",
          description: "Control 3+ objective markers",
          points: 5,
          availableInTurns: [2, 3, 4, 5]
        },
        {
          id: "hold-more",
          description: "Control more objective markers than your opponent",
          points: 5,
          availableInTurns: [3, 4, 5]
        }
      ]
    },
    {
      id: "purge-the-foe",
      name: "Purge the Foe",
      description: "Destroy enemy units to score victory points at the end of the battle round.",
      maxPointsPerTurn: [4, 8, 10, 12, 15],
      objectives: [
        {
          id: "kill-one",
          description: "Destroy 1+ enemy units",
          points: 2,
          availableInTurns: [1, 2, 3, 4, 5]
        },
        {
          id: "kill-two",
          description: "Destroy 2+ enemy units",
          points: 2,
          availableInTurns: [2, 3, 4, 5]
        },
        {
          id: "kill-three",
          description: "Destroy 3+ enemy units",
          points: 3,
          availableInTurns: [3, 4, 5]
        },
        {
          id: "kill-more",
          description: "Destroy more enemy units than you lost",
          points: 5,
          availableInTurns: [2, 3, 4, 5]
        },
        {
          id: "kill-many",
          description: "Destroy 5+ enemy units",
          points: 3,
          availableInTurns: [4, 5]
        }
      ]
    },
    {
      id: "supply-drop",
      name: "Supply Drop",
      description: "Control supply drop points to score victory points. Points increase for each objective as the battle progresses.",
      maxPointsPerTurn: [8, 10, 12, 15, 15],
      objectives: [
        {
          id: "hold-central",
          description: "Control the central objective marker",
          points: 3, // Points increase by turn in the implementation
          availableInTurns: [1, 2, 3, 4, 5]
        },
        {
          id: "hold-your-drop",
          description: "Control the objective marker in your deployment zone",
          points: 2, // Points increase by turn in the implementation
          availableInTurns: [1, 2, 3, 4, 5]
        },
        {
          id: "hold-enemy-drop",
          description: "Control the objective marker in the enemy deployment zone",
          points: 3, // Points increase by turn in the implementation
          availableInTurns: [1, 2, 3, 4, 5]
        },
        {
          id: "hold-all-drops",
          description: "Control all objective markers",
          points: 5, // Points increase by turn in the implementation
          availableInTurns: [2, 3, 4, 5]
        }
      ]
    }
  ],
  
  // Keeping old format for backward compatibility
  primaryObjectives: [
    {
      id: "take-and-hold",
      name: "Take and Hold",
      description: "Control objective markers to score victory points at the end of your Command phase.",
      pointsPerTurn: [10, 10, 12, 12, 15]
    },
    {
      id: "purge-the-foe",
      name: "Purge the Foe",
      description: "Destroy enemy units to score victory points at the end of the battle round.",
      pointsPerTurn: [4, 8, 10, 12, 15]
    },
    {
      id: "supply-drop",
      name: "Supply Drop",
      description: "Control supply drop points to score victory points. Points increase for each objective as the battle progresses.",
      pointsPerTurn: [8, 10, 12, 15, 15]
    }
  ]
};
