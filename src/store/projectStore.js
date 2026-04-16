export const saveProject = (project) => {
  const projects = getProjects()
  const newProject = { ...project, id: Date.now(), createdAt: new Date().toISOString() }
  localStorage.setItem('projects', JSON.stringify([...projects, newProject]))
  return newProject
}

export const getProjects = () => {
  return JSON.parse(localStorage.getItem('projects') || '[]')
}

export const saveTasks = (projectId, tasks) => {
  localStorage.setItem(`tasks_${String(projectId)}`, JSON.stringify(tasks))
}

export const getTasks = (projectId) => {
  return JSON.parse(localStorage.getItem(`tasks_${String(projectId)}`) || '[]')
}

export const updateTask = (projectId, taskId, updates) => {
  const tasks = getTasks(String(projectId))
  const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
  saveTasks(String(projectId), updated)
  return updated
}

export const addTask = (projectId, task) => {
  const tasks = getTasks(String(projectId))
  const newTask = { ...task, id: Date.now() }
  saveTasks(String(projectId), [...tasks, newTask])
  return newTask
}

export const deleteTask = (projectId, taskId) => {
  const tasks = getTasks(String(projectId))
  const updated = tasks.filter(t => t.id !== taskId)
  saveTasks(String(projectId), updated)
  return updated
}

export const getRisks = (projectId) => {
  return JSON.parse(localStorage.getItem(`risks_${String(projectId)}`) || '[]')
}

export const saveRisks = (projectId, risks) => {
  localStorage.setItem(`risks_${String(projectId)}`, JSON.stringify(risks))
}

export const getReports = (projectId) => {
  return JSON.parse(localStorage.getItem(`reports_${String(projectId)}`) || '[]')
}

export const saveReports = (projectId, reports) => {
  localStorage.setItem(`reports_${String(projectId)}`, JSON.stringify(reports))
}