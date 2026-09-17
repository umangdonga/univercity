import { CampusLocation, NavStep } from '../types';

/**
 * Intelligent Step Generator for Campus Walking Directions
 * Translates any campus departure and arrival point into a clear, turn-by-turn step guide.
 */
export function generateStepsForRoute(
  origin: CampusLocation,
  destination: CampusLocation
): NavStep[] {
  // If destination is Classroom B 304
  if (destination.id === 'classroom-b304') {
    return [
      {
        id: 1,
        instruction: 'Start at Main Quadrangle, walk North towards the central shaded walkway',
        distanceMeters: 40,
        direction: 'straight',
        floorNote: 'Outdoor Walkway',
        landmark: 'Passing Central Fountain',
      },
      {
        id: 2,
        instruction: 'Turn right at the breezeway towards Main Academic Building East Entrance',
        distanceMeters: 45,
        direction: 'right',
        floorNote: 'East Wing Ground Entrance',
        landmark: 'Knowledge Tree Junction',
      },
      {
        id: 3,
        instruction: 'Enter through double glass doors and head straight toward Elevator Core B',
        distanceMeters: 25,
        direction: 'straight',
        floorNote: 'Lobby Level 0',
        landmark: 'Next to Student Notice Board',
      },
      {
        id: 4,
        instruction: 'Take Lift B or the adjacent wide staircase up to the 3rd Floor (Level 3)',
        distanceMeters: 30,
        direction: 'up',
        floorNote: 'Level 3 Landing',
        landmark: 'Elevator Shaft B / Staircase East',
      },
      {
        id: 5,
        instruction: 'Step out on 3rd Floor, turn left into the North Academic Corridor',
        distanceMeters: 30,
        direction: 'left',
        floorNote: '3rd Floor Hallway',
        landmark: 'Water Dispenser & Faculty Board',
      },
      {
        id: 6,
        instruction: 'Arrive at Classroom B 304 (Lecture Hall) on your right side',
        distanceMeters: 10,
        direction: 'arrive',
        floorNote: 'Room B 304',
        landmark: 'Classroom Door B-304',
      },
    ];
  }

  // Central Library
  if (destination.id === 'central-library') {
    return [
      {
        id: 1,
        instruction: 'Head West from Central Plaza along the paved botanical walkway towards Knowledge Tower',
        distanceMeters: 55,
        direction: 'straight',
        floorNote: 'West Promenade',
        landmark: 'Botanical Garden & Benches',
      },
      {
        id: 2,
        instruction: 'Ascend the 6 wide granite steps leading to the Knowledge Tower Central Portico',
        distanceMeters: 25,
        direction: 'up',
        floorNote: 'Knowledge Tower Porch',
        landmark: 'Granite Column Colonnade',
      },
      {
        id: 3,
        instruction: 'Tap your student ID card or RFID pass at the turnstile entry gates',
        distanceMeters: 15,
        direction: 'straight',
        floorNote: 'Turnstile Gates',
        landmark: 'Security Desk & RFID Turnstile',
      },
      {
        id: 4,
        instruction: 'Walk past the circulation desk into the central atrium and take the stairs to Level 1',
        distanceMeters: 45,
        direction: 'up',
        floorNote: '1st Floor Library Wing',
        landmark: 'Central Circulation Desk',
      },
      {
        id: 5,
        instruction: 'Arrive at the Central Library Reference Section & Quiet Study Cubicles',
        distanceMeters: 20,
        direction: 'arrive',
        floorNote: 'Knowledge Tower 1st Floor',
        landmark: 'Digital Catalog Kiosk #1',
      },
    ];
  }

  // UNIQUE Canteen / Dining
  if (destination.id === 'unique-canteen' || destination.id === 'sy-cafe') {
    const isSY = destination.id === 'sy-cafe';
    return [
      {
        id: 1,
        instruction: `Follow the main shaded pedestrian boulevard towards the ${
          isSY ? 'Canteen Complex North' : 'Student Activity Center'
        }`,
        distanceMeters: 65,
        direction: 'straight',
        floorNote: 'Outdoor Walkway',
        landmark: 'Bicycle Parking Stand A',
      },
      {
        id: 2,
        instruction: isSY
          ? 'Turn left at the campus amphitheater pergola'
          : 'Turn right along the amphitheater curve towards the dining pavilions',
        distanceMeters: 45,
        direction: isSY ? 'left' : 'right',
        floorNote: 'Paved Court',
        landmark: 'Amphitheater Open Stage',
      },
      {
        id: 3,
        instruction: 'Enter through the open glass sliding doors into the main dining area',
        distanceMeters: 25,
        direction: 'straight',
        floorNote: 'Ground Floor Dining Hall',
        landmark: 'Today’s Special LED Display Board',
      },
      {
        id: 4,
        instruction: `Arrive at ${destination.name}. Self-service counters and tables are straight ahead`,
        distanceMeters: 15,
        direction: 'arrive',
        floorNote: 'Ground Level',
        landmark: 'Food Ordering & Digital Checkout Counters',
      },
    ];
  }

  // Innovation & Computer Lab
  if (destination.id === 'innovation-lab' || destination.category === 'Lab') {
    return [
      {
        id: 1,
        instruction: `Walk towards ${destination.building} along the north paved walkway`,
        distanceMeters: 60,
        direction: 'straight',
        floorNote: 'North Promenade',
        landmark: 'Campus Map Kiosk',
      },
      {
        id: 2,
        instruction: `Enter ${destination.building} through the automated glass sliding entrance`,
        distanceMeters: 30,
        direction: 'straight',
        floorNote: 'Ground Floor Lobby',
        landmark: 'Department Reception Desk',
      },
      {
        id: 3,
        instruction: 'Take the staircase or elevator to Level 2 (2nd Floor)',
        distanceMeters: 35,
        direction: 'up',
        floorNote: '2nd Floor Science Wing',
        landmark: 'Staircase B / East Lift Core',
      },
      {
        id: 4,
        instruction: 'Turn right down the Computer Science & Engineering corridor',
        distanceMeters: 40,
        direction: 'right',
        floorNote: 'Corridor 2B',
        landmark: 'Project Showcase Glass Display',
      },
      {
        id: 5,
        instruction: `Arrive at ${destination.name}. Badge-in or scan student card to enter`,
        distanceMeters: 15,
        direction: 'arrive',
        floorNote: destination.floor,
        landmark: 'Lab Entry Biometric Scanner',
      },
    ];
  }

  // Hostels
  if (destination.category === 'Hostel') {
    return [
      {
        id: 1,
        instruction: 'Head towards the campus south-west perimeter along the tree-lined student avenue',
        distanceMeters: 120,
        direction: 'straight',
        floorNote: 'Campus Perimeter Road',
        landmark: 'Solar Street Lamp Row',
      },
      {
        id: 2,
        instruction: 'Turn left into the Residential Quarters entry lane',
        distanceMeters: 80,
        direction: 'left',
        floorNote: 'Hostel Approach Gate',
        landmark: 'Residential Boundary Arch',
      },
      {
        id: 3,
        instruction: 'Stop at the 24/7 security checkpoint and scan biometric access card',
        distanceMeters: 30,
        direction: 'straight',
        floorNote: 'Security Checkpoint',
        landmark: 'Hostel Guard Booth & Turnstiles',
      },
      {
        id: 4,
        instruction: `Proceed to ${destination.name} reception lobby and common room lounge`,
        distanceMeters: 40,
        direction: 'arrive',
        floorNote: destination.floor,
        landmark: 'Hostel Reception & Mailboxes',
      },
    ];
  }

  // Admission Office / Admin
  if (destination.category === 'Admin') {
    return [
      {
        id: 1,
        instruction: 'Walk across the main university quadrangle towards Main Building Block A',
        distanceMeters: 45,
        direction: 'straight',
        floorNote: 'Central Quad',
        landmark: 'University Flagpole & Clock',
      },
      {
        id: 2,
        instruction: 'Ascend the entrance ramp into the administrative reception foyer',
        distanceMeters: 25,
        direction: 'straight',
        floorNote: 'Ground Level Foyer',
        landmark: 'Main Information Desk',
      },
      {
        id: 3,
        instruction: 'Turn right past the visitor waiting gallery into Administration Corridor A',
        distanceMeters: 30,
        direction: 'right',
        floorNote: 'Ground Floor Corridor',
        landmark: 'Visitor Directory Board',
      },
      {
        id: 4,
        instruction: `Arrive at ${destination.name}. Token numbers are displayed above the helpdesk`,
        distanceMeters: 15,
        direction: 'arrive',
        floorNote: destination.floor,
        landmark: 'Helpdesk Service Counters',
      },
    ];
  }

  // Generic intelligent step generator for all other destinations
  const steps: NavStep[] = [
    {
      id: 1,
      instruction: `Depart from ${origin.name} and head along the main campus walkway toward ${destination.building}`,
      distanceMeters: Math.round(destination.distanceMeters * 0.35),
      direction: 'straight',
      floorNote: 'Campus Walkway',
      landmark: 'Main Pedestrian Pathway',
    },
    {
      id: 2,
      instruction: `Turn towards the main entrance of ${destination.building}`,
      distanceMeters: Math.round(destination.distanceMeters * 0.25),
      direction: destination.x > origin.x ? 'right' : 'left',
      floorNote: 'Building Approach',
      landmark: `${destination.building} Signage`,
    },
    {
      id: 3,
      instruction: `Enter ${destination.building} through the ground floor lobby`,
      distanceMeters: Math.round(destination.distanceMeters * 0.15),
      direction: 'straight',
      floorNote: 'Lobby Entrance',
      landmark: 'Directory Board & Security Desk',
    },
  ];

  if (!destination.floor.toLowerCase().includes('ground') && !destination.floor.toLowerCase().includes('outdoor')) {
    steps.push({
      id: 4,
      instruction: `Take the elevator or stairs up to ${destination.floor}`,
      distanceMeters: 25,
      direction: 'up',
      floorNote: destination.floor,
      landmark: 'Central Elevator Core / Staircase',
    });
    steps.push({
      id: 5,
      instruction: `Follow corridor signs to ${destination.name}${destination.roomNumber ? ` (${destination.roomNumber})` : ''}`,
      distanceMeters: 20,
      direction: 'right',
      floorNote: destination.floor,
      landmark: `${destination.floor} Corridor`,
    });
    steps.push({
      id: 6,
      instruction: `You have arrived at ${destination.name}`,
      distanceMeters: 10,
      direction: 'arrive',
      floorNote: `${destination.building} • ${destination.floor}`,
      landmark: `Destination Doorway / Spot`,
    });
  } else {
    steps.push({
      id: 4,
      instruction: `Proceed along the ground floor wing toward ${destination.name}`,
      distanceMeters: 20,
      direction: 'straight',
      floorNote: destination.floor,
      landmark: 'Ground Floor Wing Sign',
    });
    steps.push({
      id: 5,
      instruction: `You have arrived at ${destination.name}`,
      distanceMeters: 10,
      direction: 'arrive',
      floorNote: `${destination.building} • ${destination.floor}`,
      landmark: `Destination Doorway / Spot`,
    });
  }

  return steps;
}

/**
 * Text-to-speech helper for voice directions using browser Web Speech API
 */
export function speakStepInstruction(instruction: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis notice:', err);
  }
}
