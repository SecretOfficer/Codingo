export const physicsUnits = [
  {
    id: 'p1',
    title: 'Motion & Forces',
    subtitle: 'Speed, gravity, Newton',
    color: '#ff9600',
    icon: 'MOV',
    lessons: [
      {
        id: 'p1l1',
        title: 'Speed & Acceleration',
        exercises: [
          {
            type: 'blank',
            q: 'Complete the formula for speed.',
            code: 'speed = distance / ____',
            bank: ['time', 'mass', 'force', 'area'],
            answer: ['time'],
            explain: 'Speed measures how much distance is covered in each second.'
          },
          {
            type: 'numeric',
            q: 'A cyclist covers 120 m in 20 s. What is the speed in m/s?',
            answer: 6,
            tol: 0.01,
            explain: '120 / 20 = 6 m/s.'
          },
          {
            type: 'mcq',
            q: 'What is the difference between speed and velocity?',
            options: ['Velocity also has a direction', 'Velocity is always larger', 'Speed is only for cars', 'There is none'],
            answer: 0,
            explain: 'Velocity is a vector: 5 m/s north is a different velocity from 5 m/s south.'
          },
          {
            type: 'numeric',
            q: 'A car speeds up from 0 to 20 m/s in 5 s. What is its acceleration in m/s^2?',
            answer: 4,
            tol: 0.01,
            explain: 'Acceleration = change in velocity / time = 20 / 5 = 4 m/s^2.'
          },
          {
            type: 'mcq',
            q: 'On a distance-time graph, a steeper line means...',
            options: ['a higher speed', 'a lower speed', 'the object is stopped', 'the object is reversing'],
            answer: 0,
            explain: 'The gradient of a distance-time graph is the speed.'
          },
          {
            type: 'numeric',
            q: 'Ignoring air resistance, how fast is a dropped stone moving after 3 s? Use g = 10 m/s^2.',
            answer: 30,
            tol: 0.5,
            explain: 'Velocity = g x t = 10 x 3 = 30 m/s downward.'
          }
        ]
      },
      {
        id: 'p1l2',
        title: 'Forces',
        exercises: [
          {
            type: 'blank',
            q: 'Complete Newton second law.',
            code: 'force = mass x ____',
            bank: ['acceleration', 'velocity', 'distance', 'time'],
            answer: ['acceleration'],
            explain: 'F = ma. One newton accelerates one kilogram at one metre per second squared.'
          },
          {
            type: 'numeric',
            q: 'What force accelerates a 4 kg box at 3 m/s^2? Answer in newtons.',
            answer: 12,
            tol: 0.01,
            explain: 'F = m x a = 4 x 3 = 12 N.'
          },
          {
            type: 'mcq',
            q: 'An object with balanced forces on it...',
            options: ['keeps doing what it was doing', 'always stops', 'always speeds up', 'falls'],
            answer: 0,
            explain: 'Newton first law: with no resultant force, velocity does not change.'
          },
          {
            type: 'match',
            q: 'Match each force to where it acts.',
            pairs: [['weight', 'pulls toward the Earth'], ['friction', 'opposes sliding'], ['upthrust', 'pushes up in a fluid'], ['tension', 'pulls along a rope']],
            explain: 'Weight is a force in newtons; mass in kilograms is what stays the same on the Moon.'
          },
          {
            type: 'numeric',
            q: 'What is the weight of a 6 kg bag on Earth? Use g = 10 N/kg, answer in newtons.',
            answer: 60,
            tol: 0.5,
            explain: 'Weight = mass x gravitational field strength = 6 x 10 = 60 N.'
          },
          {
            type: 'mcq',
            q: 'Newton third law says that forces...',
            options: ['come in equal and opposite pairs', 'always cancel out', 'act only on moving things', 'increase with time'],
            answer: 0,
            explain: 'The pair acts on two different objects, which is why they do not simply cancel.'
          }
        ]
      },
      {
        id: 'p1l3',
        title: 'Projectiles',
        exercises: [
          {
            type: 'mcq',
            q: 'A ball is thrown horizontally at the same moment another is dropped. Which lands first?',
            options: ['They land together', 'The thrown one', 'The dropped one', 'It depends on mass'],
            answer: 0,
            explain: 'Horizontal and vertical motion are independent. Gravity pulls both down at the same rate.'
          },
          {
            type: 'numeric',
            q: 'Ignoring air resistance, which launch angle gives the longest range? Answer in degrees.',
            answer: 45,
            tol: 0,
            explain: '45 degrees splits the launch speed evenly between height and horizontal distance.'
          },
          {
            type: 'mcq',
            q: 'At the top of its flight, a projectile has...',
            options: ['zero vertical velocity', 'zero speed', 'zero acceleration', 'maximum speed'],
            answer: 0,
            explain: 'The horizontal velocity keeps going, and gravity is still acting the whole time.'
          },
          {
            type: 'numeric',
            q: 'A stone falls freely for 2 s. How far does it drop? Use g = 10 m/s^2, answer in metres.',
            answer: 20,
            tol: 0.5,
            explain: 'distance = 0.5 x g x t^2 = 0.5 x 10 x 4 = 20 m.'
          },
          {
            type: 'order',
            q: 'Order the stages of a ball thrown straight up.',
            lines: ['leaves the hand moving upward', 'slows down as gravity acts', 'stops for an instant at the top', 'speeds up on the way down', 'returns at the launch speed'],
            explain: 'Without air resistance the flight is symmetric: up and down take equal time.'
          },
          {
            type: 'mcq',
            q: 'Why do a feather and a hammer land together on the Moon?',
            options: ['There is no air resistance', 'The Moon has no gravity', 'The hammer is heavier', 'The feather floats'],
            answer: 0,
            explain: 'Gravity gives every mass the same acceleration; only air resistance breaks the tie on Earth.'
          }
        ]
      }
    ]
  },
  {
    id: 'p2',
    title: 'Energy & Electricity',
    subtitle: 'Circuits, power, heat',
    color: '#ffc800',
    icon: 'AMP',
    lessons: [
      {
        id: 'p2l1',
        title: 'Energy',
        exercises: [
          {
            type: 'mcq',
            q: 'The law of conservation of energy says energy is...',
            options: ['transferred, never created or destroyed', 'used up by machines', 'made by engines', 'lost when it becomes heat'],
            answer: 0,
            explain: 'Wasted energy is still there, usually spread out as heat.'
          },
          {
            type: 'match',
            q: 'Match each store of energy to an example.',
            pairs: [['kinetic', 'a rolling ball'], ['gravitational', 'a book on a shelf'], ['chemical', 'food or fuel'], ['elastic', 'a stretched spring']],
            explain: 'Energy transfers between stores; the total stays the same.'
          },
          {
            type: 'numeric',
            q: 'How much gravitational energy does a 2 kg book gain lifted 3 m? Use g = 10, answer in joules.',
            answer: 60,
            tol: 0.5,
            explain: 'E = m x g x h = 2 x 10 x 3 = 60 J.'
          },
          {
            type: 'blank',
            q: 'Complete the formula for kinetic energy.',
            code: 'Ek = ____ x m x v^2',
            bank: ['1/2', '2', '1/4', 'g'],
            answer: ['1/2'],
            explain: 'Because v is squared, doubling speed gives four times the kinetic energy.'
          },
          {
            type: 'numeric',
            q: 'A lamp transfers 600 J in 10 s. What is its power in watts?',
            answer: 60,
            tol: 0.5,
            explain: 'Power = energy / time. One watt is one joule per second.'
          },
          {
            type: 'mcq',
            q: 'A machine is 40% efficient. The other 60% is...',
            options: ['transferred to less useful stores such as heat', 'destroyed', 'stored for later', 'turned into mass'],
            answer: 0,
            explain: 'Efficiency = useful energy out / total energy in.'
          }
        ]
      },
      {
        id: 'p2l2',
        title: 'Circuits',
        exercises: [
          {
            type: 'blank',
            q: 'Complete Ohm law.',
            code: 'voltage = current x ____',
            bank: ['resistance', 'power', 'charge', 'energy'],
            answer: ['resistance'],
            explain: 'V = IR. Resistance is measured in ohms.'
          },
          {
            type: 'numeric',
            q: 'A 12 V supply drives a 4 ohm resistor. What is the current in amps?',
            answer: 3,
            tol: 0.01,
            explain: 'I = V / R = 12 / 4 = 3 A.'
          },
          {
            type: 'mcq',
            q: 'In a series circuit, the current...',
            options: ['is the same everywhere', 'splits between components', 'is largest near the battery', 'is zero in the wires'],
            answer: 0,
            explain: 'Charge has only one path, so the same current passes through every component.'
          },
          {
            type: 'mcq',
            q: 'Two identical lamps in parallel across a battery, compared with one lamp alone, draw...',
            options: ['more total current', 'less total current', 'the same total current', 'no current'],
            answer: 0,
            explain: 'Each branch draws its own current, so the total from the battery increases.'
          },
          {
            type: 'numeric',
            q: 'Two 10 ohm resistors are connected in series. What is the total resistance in ohms?',
            answer: 20,
            tol: 0,
            explain: 'In series, resistances add: 10 + 10 = 20 ohms.'
          },
          {
            type: 'match',
            q: 'Match each quantity to its unit.',
            pairs: [['current', 'ampere'], ['voltage', 'volt'], ['resistance', 'ohm'], ['power', 'watt']],
            explain: 'Power in a circuit is voltage x current.'
          }
        ]
      },
      {
        id: 'p2l3',
        title: 'Heat & Waves',
        exercises: [
          {
            type: 'match',
            q: 'Match each way heat travels to its description.',
            pairs: [['conduction', 'through touching particles'], ['convection', 'flow of a heated fluid'], ['radiation', 'infrared through empty space'], ['insulation', 'slowing the transfer down']],
            explain: 'Only radiation can cross a vacuum, which is how sunlight reaches Earth.'
          },
          {
            type: 'mcq',
            q: 'Which travels fastest through air?',
            options: ['light', 'sound', 'they are equal', 'neither travels in air'],
            answer: 0,
            explain: 'Light does about 300,000,000 m/s; sound only about 340 m/s, which is why thunder lags lightning.'
          },
          {
            type: 'numeric',
            q: 'You see lightning and hear thunder 6 s later. Roughly how far away is the storm in metres? Use 340 m/s.',
            answer: 2040,
            tol: 40,
            explain: 'distance = speed x time = 340 x 6 = 2040 m, about 2 km.'
          },
          {
            type: 'blank',
            q: 'Complete the wave equation.',
            code: 'wave speed = frequency x ____',
            bank: ['wavelength', 'amplitude', 'period', 'energy'],
            answer: ['wavelength'],
            explain: 'v = f x lambda. Frequency is in hertz, wavelength in metres.'
          },
          {
            type: 'mcq',
            q: 'The amplitude of a sound wave controls its...',
            options: ['loudness', 'pitch', 'speed', 'direction'],
            answer: 0,
            explain: 'Pitch comes from frequency; amplitude carries the energy and so the volume.'
          },
          {
            type: 'numeric',
            q: 'A wave has frequency 5 Hz and wavelength 2 m. What is its speed in m/s?',
            answer: 10,
            tol: 0.01,
            explain: 'v = f x lambda = 5 x 2 = 10 m/s.'
          }
        ]
      }
    ]
  }
];
