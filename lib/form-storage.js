// Form configuration storage module
// In production, replace this with a database (PostgreSQL, MongoDB, etc.)

let formConfigs = {
  '101-checkin': {
    id: '101-checkin',
    name: '101 Student Check-in Form',
    description: 'Bi-weekly check-in form for 101 students',
    portals: ['101'], // Forms assigned to portals
    fields: [
      {
        id: 'studentName',
        type: 'text',
        label: 'What is your name?',
        placeholder: 'Enter your name',
        required: true,
        order: 0,
      },
      {
        id: 'date',
        type: 'date',
        label: "Today's Date",
        placeholder: '',
        required: true,
        order: 1,
      },
      {
        id: 'launchpadWeekRating',
        type: 'radio',
        label: 'How are things going at Launchpad for you this week?',
        options: ['1', '2', '3', '4', '5'],
        required: false,
        order: 2,
      },
      {
        id: 'assignmentConfidence',
        type: 'radio',
        label: 'How confident do you feel about staying on track with your assignments this week?',
        options: ['1', '2', '3', '4', '5'],
        required: true,
        order: 3,
      },
      {
        id: 'assignmentAssistance',
        type: 'textarea',
        label: 'What assistance do you feel you need to stay on track with your assignments?',
        placeholder: 'Describe what assistance you need...',
        required: true,
        order: 4,
      },
      {
        id: 'challengesBarriers',
        type: 'radio',
        label: 'Are you currently experiencing any challenges or barriers? (Personal, academic, or professional)',
        options: ['Personal', 'Academic', 'Professional', 'Other', 'None'],
        required: true,
        order: 5,
      },
      {
        id: 'barrierAssistance',
        type: 'textarea',
        label: 'What assistance do you feel you need surrounding the indicated barrier(s)?',
        placeholder: 'Describe what assistance you need...',
        required: true,
        order: 6,
      },
      {
        id: 'extraSupport',
        type: 'textarea',
        label: 'Are there any areas where you could use extra support? (resources, stress, mental health, time management, clothing, food, transportation, etc.)',
        placeholder: 'List any areas where you need extra support...',
        required: true,
        order: 7,
      },
      {
        id: 'stepsTaken',
        type: 'textarea',
        label: "If you're facing challenges, what steps have you already taken to address them?",
        placeholder: "Describe the steps you've taken...",
        required: true,
        order: 8,
      },
      {
        id: 'highSchoolUpdates',
        type: 'radio',
        label: 'Are there any high school updates you\'d like to discuss? For 101 student only. Liftoff please select none.',
        options: ['Credits', 'Class Updates', 'Counselor Meetings', 'Attendance Challenges', 'College Readiness', 'None', 'Option 7'],
        required: true,
        order: 9,
      },
      {
        id: 'highSchoolAssistance',
        type: 'textarea',
        label: 'What assistant do you feel you need surrounding high school? *Skip if you are in Liftoff',
        placeholder: 'Describe what assistance you need (skip if in Liftoff)...',
        required: false,
        order: 10,
      },
      {
        id: 'beaconDeliverables',
        type: 'radio',
        label: 'Are you up to date with your Beacon deliverables?',
        options: ['Yes', 'No', 'I\'m not sure'],
        required: true,
        order: 11,
      },
      {
        id: 'missingDeliverables',
        type: 'textarea',
        label: "If no, list any deliverables you're missing.",
        placeholder: 'List any missing deliverables...',
        required: false,
        conditional: {
          field: 'beaconDeliverables',
          value: 'No',
        },
        order: 12,
      },
      {
        id: 'questionsFeedback',
        type: 'textarea',
        label: 'Do you have any questions, feedback, or concerns?',
        placeholder: 'Share any questions, feedback, or concerns...',
        required: true,
        order: 13,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  'liftoff-checkin': {
    id: 'liftoff-checkin',
    name: 'Liftoff Student Check-in Form',
    description: 'Bi-weekly check-in form for Liftoff students',
    portals: ['liftoff'], // Forms assigned to portals
    fields: [
      {
        id: 'studentName',
        type: 'text',
        label: 'What is your name?',
        placeholder: 'Enter your name',
        required: true,
        order: 0,
      },
      {
        id: 'date',
        type: 'date',
        label: "Today's Date",
        placeholder: '',
        required: true,
        order: 1,
      },
      {
        id: 'launchpadWeekRating',
        type: 'radio',
        label: 'How are things going at Launchpad for you this week?',
        options: ['1', '2', '3', '4', '5'],
        required: false,
        order: 2,
      },
      {
        id: 'assignmentConfidence',
        type: 'radio',
        label: 'How confident do you feel about staying on track with your assignments this week?',
        options: ['1', '2', '3', '4', '5'],
        required: true,
        order: 3,
      },
      {
        id: 'assignmentAssistance',
        type: 'textarea',
        label: 'What assistance do you feel you need to stay on track with your assignments?',
        placeholder: 'Describe what assistance you need...',
        required: true,
        order: 4,
      },
      {
        id: 'challengesBarriers',
        type: 'radio',
        label: 'Are you currently experiencing any challenges or barriers? (Personal, academic, or professional)',
        options: ['Personal', 'Academic', 'Professional', 'Other', 'None'],
        required: true,
        order: 5,
      },
      {
        id: 'barrierAssistance',
        type: 'textarea',
        label: 'What assistance do you feel you need surrounding the indicated barrier(s)?',
        placeholder: 'Describe what assistance you need...',
        required: true,
        order: 6,
      },
      {
        id: 'extraSupport',
        type: 'textarea',
        label: 'Are there any areas where you could use extra support? (resources, stress, mental health, time management, clothing, food, transportation, etc.)',
        placeholder: 'List any areas where you need extra support...',
        required: true,
        order: 7,
      },
      {
        id: 'stepsTaken',
        type: 'textarea',
        label: "If you're facing challenges, what steps have you already taken to address them?",
        placeholder: "Describe the steps you've taken...",
        required: true,
        order: 8,
      },
      {
        id: 'beaconDeliverables',
        type: 'radio',
        label: 'Are you up to date with your Beacon deliverables?',
        options: ['Yes', 'No', 'I\'m not sure'],
        required: true,
        order: 9,
      },
      {
        id: 'missingDeliverables',
        type: 'textarea',
        label: "If no, list any deliverables you're missing.",
        placeholder: 'List any missing deliverables...',
        required: false,
        conditional: {
          field: 'beaconDeliverables',
          value: 'No',
        },
        order: 10,
      },
      {
        id: 'questionsFeedback',
        type: 'textarea',
        label: 'Do you have any questions, feedback, or concerns?',
        placeholder: 'Share any questions, feedback, or concerns...',
        required: true,
        order: 11,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  'calendar-event': {
    id: 'calendar-event',
    name: 'Calendar Event Request Form',
    description: 'Form for requesting calendar events',
    portals: ['101', 'liftoff'], // Forms assigned to portals
    fields: [
      {
        id: 'studentName',
        type: 'text',
        label: 'Your Name',
        placeholder: 'Enter your name',
        required: true,
        order: 0,
      },
      {
        id: 'title',
        type: 'text',
        label: 'Event Title',
        placeholder: 'e.g., Study Session, Meeting, Workshop',
        required: true,
        order: 1,
      },
      {
        id: 'start',
        type: 'datetime-local',
        label: 'Start Date & Time',
        placeholder: '',
        required: true,
        order: 2,
      },
      {
        id: 'end',
        type: 'datetime-local',
        label: 'End Date & Time',
        placeholder: '',
        required: true,
        order: 3,
      },
      {
        id: 'location',
        type: 'text',
        label: 'Location (Optional)',
        placeholder: 'e.g., Room 101, Online, Zoom Meeting',
        required: false,
        order: 4,
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'Description (Optional)',
        placeholder: 'Add any additional details about the event...',
        required: false,
        order: 5,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
}

export function getFormConfig(formId) {
  return formConfigs[formId] || null
}

export function getAllFormConfigs() {
  return Object.values(formConfigs)
}

export function saveFormConfig(formConfig) {
  if (!formConfig.id) {
    formConfig.id = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  formConfig.updatedAt = new Date().toISOString()
  // Ensure portals array exists
  if (!formConfig.portals) {
    formConfig.portals = []
  }
  formConfigs[formConfig.id] = formConfig
  return formConfig
}

export function getFormsByPortal(portalId) {
  return Object.values(formConfigs).filter(form => 
    form.portals && form.portals.includes(portalId)
  )
}

export function deleteFormConfig(formId) {
  if (formConfigs[formId]) {
    delete formConfigs[formId]
    return true
  }
  return false
}

