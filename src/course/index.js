import u1 from './unit1.js';
import u2 from './unit2.js';
import u3 from './unit3.js';
import u4 from './unit4.js';
import u5 from './unit5.js';
import u6 from './unit6.js';
import u7 from './unit7.js';
import u8 from './unit8.js';
import { mathUnits } from './math.js';
import { physicsUnits } from './physics.js';
import { chemistryUnits } from './chemistry.js';
import { biologyUnits } from './biology.js';

const rawSubjects = [
  {
    id: 'code',
    name: 'Coding',
    tagline: 'Python from print() to classes',
    color: '#7fa650',
    icon: '</>',
    units: [u1, u2, u3, u4, u5, u6, u7, u8]
  },
  {
    id: 'math',
    name: 'Mathematics',
    tagline: 'Number, algebra, geometry, data',
    color: '#6a9cb0',
    icon: 'x+y',
    units: mathUnits
  },
  {
    id: 'physics',
    name: 'Physics',
    tagline: 'Motion, forces, energy, circuits',
    color: '#d07e3a',
    icon: 'F=ma',
    units: physicsUnits
  },
  {
    id: 'chem',
    name: 'Chemistry',
    tagline: 'Atoms, bonding, reactions, pH',
    color: '#b07cc6',
    icon: 'H2O',
    units: chemistryUnits
  },
  {
    id: 'bio',
    name: 'Biology',
    tagline: 'Cells, bodies, genes, ecosystems',
    color: '#59a392',
    icon: 'DNA',
    units: biologyUnits
  }
];

// Every unit ends with a generated review lesson that resamples that unit's pool.
export const subjects = rawSubjects.map((subject) => ({
  ...subject,
  units: subject.units.map((unit) => ({
    ...unit,
    subjectId: subject.id,
    lessons: unit.lessons.concat([{
      id: unit.id + 'rev',
      title: 'Unit Review',
      review: true,
      size: 8,
      exercises: []
    }])
  }))
}));

// Themed worlds for the coding track, the map the learner walks through.
export const worlds = [
  { id: 'sands', name: 'Syntax Sands', tagline: 'Where every program starts', units: ['u1', 'u2'], color: '#e0a83c' },
  { id: 'lagoon', name: 'Logic Lagoon', tagline: 'Text, truth and branching', units: ['u3', 'u4'], color: '#6a9cb0' },
  { id: 'steppes', name: 'Structure Steppes', tagline: 'Collections and repetition', units: ['u5'], color: '#7fa650' },
  { id: 'ascent', name: 'Algorithm Ascent', tagline: 'Functions and data shapes', units: ['u6', 'u7'], color: '#d07e3a' },
  { id: 'apex', name: "Architect's Apex", tagline: 'Objects, failure and files', units: ['u8'], color: '#9b6bc0' }
];

export function worldOfUnit(unitId) {
  return worlds.find((w) => w.units.includes(unitId)) || null;
}

export const lessonList = [];
export const unitList = [];
const lessonIndex = new Map();
const unitIndex = new Map();
const subjectIndex = new Map();

subjects.forEach((subject) => {
  subject.lessons = [];
  subject.units.forEach((unit) => {
    unit.subjectId = subject.id;
    unitList.push(unit);
    unit.lessons.forEach((lesson) => {
      lesson.unitId = unit.id;
      lesson.subjectId = subject.id;
      lesson.orderInSubject = subject.lessons.length;
      lesson.globalOrder = lessonList.length;
      subject.lessons.push(lesson);
      lessonList.push(lesson);
      lessonIndex.set(lesson.id, lesson);
      unitIndex.set(lesson.id, unit);
      subjectIndex.set(lesson.id, subject);
    });
  });
});

export function getLesson(id) {
  return lessonIndex.get(id) || null;
}

export function getUnitOf(lessonId) {
  return unitIndex.get(lessonId) || null;
}

export function getSubjectOf(lessonId) {
  return subjectIndex.get(lessonId) || null;
}

export function getSubject(subjectId) {
  return subjects.find((s) => s.id === subjectId) || null;
}

export function getUnit(unitId) {
  return unitList.find((u) => u.id === unitId) || null;
}

// Pool of every non-review exercise in a unit, used to build review sessions.
export function unitPool(unitId) {
  const unit = getUnit(unitId);
  if (!unit) return [];
  const out = [];
  unit.lessons.forEach((lesson) => {
    if (lesson.review) return;
    lesson.exercises.forEach((ex) => out.push(ex));
  });
  return out;
}

export const totalLessons = lessonList.length;
export const totalExercises = lessonList.reduce((n, l) => n + l.exercises.length, 0);
