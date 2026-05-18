import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ListTodo, 
  CheckSquare, 
  Bug, 
  LogOut, 
  ArrowRight,
  ClipboardList,
  Plus,
  FolderGit2,
  X,
  GripVertical,
  Edit,
  Trash2,
  AlignLeft,
  User,
  Users,
  KeyRound,
  Lock
} from 'lucide-react';

export default function App() {
  // --- 1. 全局数据状态 ---
  const [users, setUsers] = useState([{ id: '1', username: 'root', password: '123456', role: 'admin' }]);
  const [currentUser, setCurrentUser] = useState(null); // null 表示未登录

  const [activeMenu, setActiveMenu] = useState('overview'); // 默认展示概览页以便查看数据

  const [projects, setProjects] = useState([
    { id: '02', name: '泉州移动数字人项目', description: '基于大模型的数字人互动系统，支持语音识别与生成。', status: 'active' },
    { id: '01', name: '云端后台开发', description: '重构现有的后台管理系统，提升性能。', status: 'planning' },
  ]);

  const [requirements, setRequirements] = useState([
    { id: 'R-1', title: '跳过播放', projectId: '02', priority: 'medium', status: 'developing' },
    { id: 'R-2', title: '边走边播', projectId: '02', priority: 'medium', status: 'draft' }
  ]);

  const [tasks, setTasks] = useState([
    { id: 'T-1', title: '完成登录页面UI', description: '按照Figma设计稿，实现支持响应式的登录页面。包含账号密码和验证码登录。', projectId: '01', priority: 'high', assignee: '张三', status: 'todo' },
    { id: 'T-2', title: '搭建基础项目骨架', description: '初始化React项目，配置TailwindCSS，封装基础Axios请求。', projectId: '02', priority: 'medium', assignee: '李四', status: 'doing' }
  ]);

  const [bugs, setBugs] = useState([
    { id: 'B-1', title: '首屏加载白屏时间过长', projectId: '01', steps: '1. 清理浏览器缓存\n2. 访问首页\n3. 观察首屏出现时间大于5秒', priority: 'high', severity: 'major', status: 'open', assignee: '前端大牛' }
  ]);

  // --- 2. 弹窗与表单状态管理 ---
  
  // 项目 Modal
  const [projectModal, setProjectModal] = useState({ isOpen: false, isEdit: false, data: { name: '', description: '', status: 'planning' } });
  
  // 需求 Modal
  const [reqModal, setReqModal] = useState({ isOpen: false, data: { title: '', projectId: '', priority: 'medium', status: 'draft' } });
  const [reqFilter, setReqFilter] = useState({ projectId: 'all', priority: 'all', status: 'all' });
  
  // 任务 Modal
  const [taskModal, setTaskModal] = useState({ isOpen: false, isEdit: false, data: { title: '', description: '', projectId: '', priority: 'medium', assignee: '' } });
  
  // Bug Modal
  const [bugModal, setBugModal] = useState({ isOpen: false, isEdit: false, data: { title: '', projectId: '', steps: '', priority: 'high', severity: 'major', assignee: '', status: 'open' } });

  // 用户与密码 Modal
  const [pwdModal, setPwdModal] = useState({ isOpen: false, oldPwd: '', newPwd: '', confirmPwd: '' });
  const [userModal, setUserModal] = useState({ isOpen: false, username: '', password: '', role: 'user' });
  const [loginData, setLoginData] = useState({ username: 'root', password: '123456' });

  // --- 3. 辅助函数 ---
  const getProjectName = (projectId) => {
    const p = projects.find(p => p.id === projectId);
    return p ? p.name : '未知项目';
  };

  // --- 4. 业务处理函数 ---

  // 项目 CRUD
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (projectModal.isEdit) {
      setProjects(projects.map(p => p.id === projectModal.data.id ? projectModal.data : p));
    } else {
      const newId = String(projects.length > 0 ? Math.max(...projects.map(p => parseInt(p.id))) + 1 : 1).padStart(2, '0');
      setProjects([{ ...projectModal.data, id: newId }, ...projects]);
    }
    setProjectModal({ isOpen: false, isEdit: false, data: {} });
  };

  const handleDeleteProject = (e, id) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个项目吗？相关的需求和任务可能会失去关联。')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  // 需求 CRUD
  const handleSaveRequirement = (e) => {
    e.preventDefault();
    const newId = `R-${Date.now().toString().slice(-4)}`;
    setRequirements([{ ...reqModal.data, id: newId }, ...requirements]);
    setReqModal({ isOpen: false, data: {} });
  };

  const handleChangeReqStatus = (reqId, newStatus) => {
    setRequirements(requirements.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
  };

  // 任务 CRUD
  const handleSaveTask = (e) => {
    e.preventDefault();
    if (taskModal.isEdit) {
      setTasks(tasks.map(t => t.id === taskModal.data.id ? { ...t, ...taskModal.data } : t));
    } else {
      const newId = `T-${Date.now().toString().slice(-4)}`;
      setTasks([...tasks, { ...taskModal.data, id: newId, status: 'todo' }]);
    }
    setTaskModal({ isOpen: false, isEdit: false, data: {} });
  };

  const handleDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);
  const handleDrop = (e, targetStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status: targetStatus } : task));
  };

  // Bug CRUD
  const handleSaveBug = (e) => {
    e.preventDefault();
    if (bugModal.isEdit) {
      setBugs(bugs.map(b => b.id === bugModal.data.id ? { ...b, ...bugModal.data } : b));
    } else {
      const newId = `B-${Date.now().toString().slice(-4)}`;
      setBugs([{ ...bugModal.data, id: newId, status: bugModal.data.status || 'open' }, ...bugs]);
    }
    setBugModal({ isOpen: false, isEdit: false, data: {} });
  };

  const handleChangeBugStatus = (bugId, newStatus) => {
    setBugs(bugs.map(b => b.id === bugId ? { ...b, status: newStatus } : b));
  };

  const handleDeleteBug = (id) => {
    if (window.confirm('确定要删除这个 Bug 吗？')) {
      setBugs(bugs.filter(b => b.id !== id));
    }
  };

  // --- 账户与权限控制 ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginData.username && u.password === loginData.password);
    if (user) {
      setCurrentUser(user);
      setActiveMenu('overview'); // 登录后默认跳转到概览
    } else {
      alert('用户名或密码错误！');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleChangePwd = (e) => {
    e.preventDefault();
    if (pwdModal.newPwd !== pwdModal.confirmPwd) return alert('两次输入的新密码不一致！');
    if (currentUser.password !== pwdModal.oldPwd) return alert('原密码错误！');
    
    setUsers(users.map(u => u.id === currentUser.id ? { ...u, password: pwdModal.newPwd } : u));
    setCurrentUser({ ...currentUser, password: pwdModal.newPwd });
    setPwdModal({ isOpen: false, oldPwd: '', newPwd: '', confirmPwd: '' });
    alert('密码修改成功！');
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (users.find(u => u.username === userModal.username)) return alert('用户名已存在！');
    const newId = String(Date.now());
    setUsers([...users, { id: newId, username: userModal.username, password: userModal.password, role: userModal.role }]);
    setUserModal({ isOpen: false, username: '', password: '', role: 'user' });
    alert('账户创建成功！');
  };

  // --- 5. 视图渲染 ---

  // 配置常量
  const projectStatusMap = {
    'planning': { label: '规划中', color: 'bg-slate-100 text-slate-500' },
    'active': { label: '进行中', color: 'bg-[#e6f4ff] text-[#096dd9]' },
    'paused': { label: '暂停', color: 'bg-amber-50 text-amber-600' },
    'completed': { label: '已完成', color: 'bg-green-50 text-green-600' }
  };

  const reqStatusMap = {
    'draft': { label: '草稿', color: 'bg-slate-100 text-slate-600' },
    'active': { label: '激活', color: 'bg-blue-50 text-blue-600' },
    'developing': { label: '开发中', color: 'bg-[#e6f4ff] text-[#096dd9]' },
    'tested': { label: '已测', color: 'bg-purple-50 text-purple-600' },
    'released': { label: '已发布', color: 'bg-green-50 text-green-600' },
    'closed': { label: '关闭', color: 'bg-red-50 text-red-600' }
  };

  const priorityMap = {
    'high': { label: '高', color: 'text-red-500 bg-red-50 border-red-100' },
    'medium': { label: '中', color: 'text-[#096dd9] bg-[#e6f4ff] border-[#91caff]' },
    'low': { label: '低', color: 'text-slate-500 bg-slate-50 border-slate-200' }
  };

  const renderOverview = () => {
    // 1. 根据真实业务逻辑进行数据清洗和统计
    const unresolvedBugs = bugs.filter(b => b.status === 'open' || b.status === 'fixing');
    const doingTasks = tasks.filter(t => t.status === 'doing');
    const recentProjects = [...projects].reverse().slice(0, 5); // 取最新添加的5个项目
    const highPriorityBugs = unresolvedBugs.filter(b => b.priority === 'high' || b.severity === 'critical' || b.severity === 'major');

    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">工作台</h1>
          <p className="text-slate-500 text-sm">团队当前进展一览</p>
        </div>
        
        {/* 顶部数据统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { key: 'projects', label: '项目总数', count: projects.length, icon: <FolderKanban size={24} />, color: 'blue' },
            { key: 'requirements', label: '需求总数', count: requirements.length, icon: <ClipboardList size={24} />, color: 'cyan' },
            { key: 'tasks', label: '进行中任务', count: doingTasks.length, icon: <CheckSquare size={24} />, color: 'amber' },
            { key: 'bugs', label: '未解决 BUG', count: unresolvedBugs.length, icon: <Bug size={24} />, color: 'red' }
          ].map(item => (
            <div key={item.key} onClick={() => setActiveMenu(item.key)} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm mb-1">{item.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{item.count}</h3>
                </div>
                <div className={`bg-${item.color}-50 p-3 rounded-lg text-${item.color}-600`}>
                  {item.icon}
                </div>
              </div>
              <div className={`mt-4 flex items-center text-sm text-slate-400 hover:text-${item.color}-600 transition-colors`}>
                查看详情 <ArrowRight size={14} className="ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* 底部详细列表面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 最近项目面板 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col max-h-[400px]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">最近项目</h2>
              <button className="text-blue-600 text-sm hover:underline" onClick={() => setActiveMenu('projects')}>全部</button>
            </div>
            <div className="p-2 overflow-y-auto">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors" onClick={() => setActiveMenu('projects')}>
                  <div>
                    <h4 className="font-medium text-slate-800">{project.name}</h4>
                    <span className="text-xs text-slate-400">ID: {project.id}</span>
                  </div>
                  <span className={`${projectStatusMap[project.status].color} text-xs px-2.5 py-1 rounded-full font-medium`}>
                    {projectStatusMap[project.status].label}
                  </span>
                </div>
              ))}
              {recentProjects.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">暂无项目</div>}
            </div>
          </div>

          {/* 高优待办 Bug 面板 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col max-h-[400px]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 flex items-center">
                高优待办 Bug
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{highPriorityBugs.length}</span>
              </h2>
              <button className="text-blue-600 text-sm hover:underline" onClick={() => setActiveMenu('bugs')}>全部</button>
            </div>
            <div className="p-2 overflow-y-auto">
              {highPriorityBugs.map((bug) => (
                <div key={bug.id} className="flex flex-col p-4 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-50 last:border-0" onClick={() => setActiveMenu('bugs')}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-800 text-sm">{bug.title}</h4>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{getProjectName(bug.projectId)}</span>
                    <span className="flex items-center text-blue-600"><User size={12} className="mr-1" /> {bug.assignee || '未指派'}</span>
                  </div>
                </div>
              ))}
              {highPriorityBugs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <span className="text-3xl mb-3">🎉</span>
                  <p className="text-sm">太棒了，目前没有高优待办的 Bug</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">项目</h1>
          <p className="text-slate-500 text-sm">管理团队所有项目</p>
        </div>
        <button 
          onClick={() => setProjectModal({ isOpen: true, isEdit: false, data: { name: '', description: '', status: 'planning' } })}
          className="bg-[#0052cc] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center font-medium transition-colors text-sm"
        >
          <Plus size={16} className="mr-1" /> 新建项目
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col justify-between h-48 relative group">
            <div className="flex justify-between items-start">
              <div className="bg-blue-50 p-2 rounded text-blue-500">
                <FolderGit2 size={24} />
              </div>
              <div className="flex items-center space-x-2">
                <span className={`${projectStatusMap[project.status].color} text-xs px-2.5 py-1 rounded-full font-medium`}>
                  {projectStatusMap[project.status].label}
                </span>
                {/* 悬浮操作按钮 */}
                <div className="hidden group-hover:flex space-x-1 bg-white shadow-sm border border-slate-100 rounded p-1 absolute top-4 right-4">
                  <button onClick={() => setProjectModal({ isOpen: true, isEdit: true, data: project })} className="p-1 text-slate-400 hover:text-blue-600 rounded">
                    <Edit size={14} />
                  </button>
                  <button onClick={(e) => handleDeleteProject(e, project.id)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex-1">
              <span className="text-xs text-slate-400 block mb-1">ID: {project.id}</span>
              <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{project.name}</h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{project.description || '暂无描述'}</p>
            </div>
          </div>
        ))}
      </div>

      {projectModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">{projectModal.isEdit ? '编辑项目' : '新建项目'}</h3>
              <button onClick={() => setProjectModal({ isOpen: false, data: {} })}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目名称 *</label>
                <input required value={projectModal.data.name} onChange={e => setProjectModal({ ...projectModal, data: { ...projectModal.data, name: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目描述</label>
                <textarea rows="3" value={projectModal.data.description} onChange={e => setProjectModal({ ...projectModal, data: { ...projectModal.data, description: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目状态</label>
                <select value={projectModal.data.status} onChange={e => setProjectModal({ ...projectModal, data: { ...projectModal.data, status: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none">
                  {Object.entries(projectStatusMap).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setProjectModal({ isOpen: false, isEdit: false, data: {} })} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded">取消</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderRequirements = () => {
    // 应用筛选逻辑
    const filteredRequirements = requirements.filter(req => {
      const matchProject = reqFilter.projectId === 'all' || req.projectId === reqFilter.projectId;
      const matchPriority = reqFilter.priority === 'all' || req.priority === reqFilter.priority;
      const matchStatus = reqFilter.status === 'all' || req.status === reqFilter.status;
      return matchProject && matchPriority && matchStatus;
    });

    return (
      <div className="animate-in fade-in duration-300 h-full flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">需求池</h1>
            <p className="text-slate-500 text-sm">跨项目的需求/Story 全景</p>
          </div>
          <button 
            onClick={() => setReqModal({ isOpen: true, data: { title: '', projectId: projects[0]?.id || '', priority: 'medium', status: 'draft' } })}
            className="bg-[#0052cc] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center font-medium transition-colors text-sm"
          >
            <Plus size={16} className="mr-1" /> 新建需求
          </button>
        </div>

        {/* 筛选工具栏 */}
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <select
            value={reqFilter.projectId}
            onChange={(e) => setReqFilter({ ...reqFilter, projectId: e.target.value })}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white min-w-[150px]"
          >
            <option value="all">全部项目</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select
            value={reqFilter.priority}
            onChange={(e) => setReqFilter({ ...reqFilter, priority: e.target.value })}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white min-w-[120px]"
          >
            <option value="all">所有优先级</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>

          <select
            value={reqFilter.status}
            onChange={(e) => setReqFilter({ ...reqFilter, status: e.target.value })}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white min-w-[120px]"
          >
            <option value="all">所有状态</option>
            {Object.entries(reqStatusMap).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          {(reqFilter.projectId !== 'all' || reqFilter.priority !== 'all' || reqFilter.status !== 'all') && (
            <button
              onClick={() => setReqFilter({ projectId: 'all', priority: 'all', status: 'all' })}
              className="text-sm text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors rounded-lg hover:bg-blue-50"
            >
              重置筛选
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="font-medium py-3 px-4 w-1/3">标题</th>
                <th className="font-medium py-3 px-4 w-1/4">项目</th>
                <th className="font-medium py-3 px-4 w-32 text-center">优先级</th>
                <th className="font-medium py-3 px-4 w-32 text-center">状态</th>
                <th className="font-medium py-3 px-4 w-32 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.map((req, idx) => (
                <tr key={req.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 text-sm font-medium text-slate-800">{req.title}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{getProjectName(req.projectId)}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded border ${priorityMap[req.priority].color}`}>
                      {priorityMap[req.priority].label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${reqStatusMap[req.status].color}`}>
                      {reqStatusMap[req.status].label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <select 
                      value={req.status}
                      onChange={(e) => handleChangeReqStatus(req.id, e.target.value)}
                      className="text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 bg-white"
                    >
                      {Object.entries(reqStatusMap).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredRequirements.length === 0 && (
                <tr><td colSpan="5" className="text-center py-12 text-slate-400">没有符合条件的需求</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {reqModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">新建需求</h3>
                <button onClick={() => setReqModal({ isOpen: false, data: {} })}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
              </div>
              <form onSubmit={handleSaveRequirement} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">需求标题 *</label>
                  <input required value={reqModal.data.title} onChange={e => setReqModal({ ...reqModal, data: { ...reqModal.data, title: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">所属项目 *</label>
                  <select required value={reqModal.data.projectId} onChange={e => setReqModal({ ...reqModal, data: { ...reqModal.data, projectId: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none">
                    <option value="" disabled>选择项目...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                    <select value={reqModal.data.priority} onChange={e => setReqModal({ ...reqModal, data: { ...reqModal.data, priority: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none">
                      <option value="high">高</option><option value="medium">中</option><option value="low">低</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">初始状态</label>
                    <select value={reqModal.data.status} onChange={e => setReqModal({ ...reqModal, data: { ...reqModal.data, status: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none">
                       {Object.entries(reqStatusMap).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setReqModal({ isOpen: false, data: {} })} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded">取消</button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">创建</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 新增: 恢复因为截断缺失的 renderTasks 渲染函数 ---
  const renderTasks = () => {
    const columns = [
      { id: 'todo', title: '待办事项', color: 'slate' },
      { id: 'doing', title: '进行中', color: 'blue' },
      { id: 'done', title: '已完成', color: 'green' }
    ];

    return (
      <div className="animate-in fade-in duration-300 h-full flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">任务看板</h1>
            <p className="text-slate-500 text-sm">拖拽更改状态，双击卡片进行编辑</p>
          </div>
          <button 
            onClick={() => setTaskModal({ isOpen: true, isEdit: false, data: { title: '', description: '', projectId: projects[0]?.id || '', priority: 'medium', assignee: '' } })}
            className="bg-[#0052cc] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center font-medium transition-colors text-sm"
          >
            <Plus size={16} className="mr-1" /> 新建任务
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {columns.map(col => (
            <div 
              key={col.id}
              className="bg-slate-100/50 rounded-xl p-4 min-w-[320px] flex flex-col border border-slate-200"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-slate-700 flex items-center">
                  <span className={`w-2 h-2 rounded-full bg-${col.color}-500 mr-2`}></span>
                  {col.title}
                </h3>
                <span className="bg-white border border-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDoubleClick={() => setTaskModal({ isOpen: true, isEdit: true, data: task })}
                    className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-move hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded max-w-[120px] truncate">
                        {getProjectName(task.projectId)}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${priorityMap[task.priority].color}`}>
                        {priorityMap[task.priority].label}
                      </span>
                    </div>
                    
                    <h4 className={`text-sm font-bold mb-2 ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </h4>
                    
                    {task.description && (
                       <div className="bg-slate-50 rounded p-2 mb-3">
                         <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                           {task.description}
                         </p>
                       </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">{task.id}</span>
                      {task.assignee && (
                        <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                          <User size={12} className="mr-1" /> {task.assignee}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg h-24 flex items-center justify-center text-slate-400 text-sm">
                    拖拽至此
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {taskModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">{taskModal.isEdit ? '编辑任务' : '新建任务'}</h3>
                <button onClick={() => setTaskModal({ isOpen: false, data: {} })}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
              </div>
              <form onSubmit={handleSaveTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">任务名称 *</label>
                  <input required value={taskModal.data.title} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, title: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">任务描述</label>
                  <textarea rows="4" value={taskModal.data.description} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, description: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none" placeholder="详细描述任务要求..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">所属项目 *</label>
                    <select required value={taskModal.data.projectId} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, projectId: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none">
                      <option value="" disabled>选择项目...</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">指派给</label>
                    <input value={taskModal.data.assignee} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, assignee: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none" placeholder="输入姓名" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                  <select value={taskModal.data.priority} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, priority: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none">
                    <option value="high">高</option><option value="medium">中</option><option value="low">低</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setTaskModal({ isOpen: false, data: {} })} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded">取消</button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">保存</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBugs = () => {
    const severityMap = {
      'critical': { label: '致命', color: 'bg-red-600 text-white' },
      'major': { label: '严重', color: 'bg-orange-500 text-white' },
      'minor': { label: '一般', color: 'bg-blue-500 text-white' },
      'trivial': { label: '轻微', color: 'bg-slate-400 text-white' }
    };

    const bugStatusMap = {
      'open': { label: '待处理', color: 'bg-red-50 text-red-600 border-red-200' },
      'fixing': { label: '修复中', color: 'bg-blue-50 text-blue-600 border-blue-200' },
      'fixed': { label: '已修复', color: 'bg-green-50 text-green-600 border-green-200' },
      'closed': { label: '已归档', color: 'bg-slate-100 text-slate-500 border-slate-200' }
    };

    return (
      <div className="animate-in fade-in duration-300 h-full flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Bug 追踪</h1>
            <p className="text-slate-500 text-sm">记录缺陷、复现步骤及状态流转</p>
          </div>
          <button 
            onClick={() => setBugModal({ isOpen: true, isEdit: false, data: { title: '', projectId: projects[0]?.id || '', steps: '', priority: 'high', severity: 'major', assignee: '', status: 'open' } })}
            className="bg-[#0052cc] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center font-medium transition-colors text-sm"
          >
            <Plus size={16} className="mr-1" /> 提 Bug
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-4">
          {bugs.map(bug => (
             <div key={bug.id} className={`bg-white rounded-lg border shadow-sm p-5 transition-colors relative group ${bug.status === 'closed' ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-blue-300'}`}>
               
               <div className="hidden group-hover:flex space-x-1 bg-white shadow-sm border border-slate-100 rounded p-1 absolute top-4 right-4 z-10">
                 <button onClick={() => setBugModal({ isOpen: true, isEdit: true, data: bug })} className="p-1 text-slate-400 hover:text-blue-600 rounded">
                   <Edit size={14} />
                 </button>
                 <button onClick={() => handleDeleteBug(bug.id)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                   <Trash2 size={14} />
                 </button>
               </div>

               <div className="flex justify-between items-start mb-3 pr-16">
                 <div className="flex items-center space-x-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded shadow-sm ${severityMap[bug.severity].color}`}>
                      {severityMap[bug.severity].label}
                    </span>
                    <h3 className={`font-bold text-lg ${bug.status === 'closed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{bug.title}</h3>
                 </div>
                 <div className="flex items-center space-x-2">
                    <select 
                      value={bug.status}
                      onChange={(e) => handleChangeBugStatus(bug.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded border outline-none cursor-pointer ${bugStatusMap[bug.status].color}`}
                    >
                      {Object.entries(bugStatusMap).map(([key, val]) => (
                        <option key={key} value={key} className="text-slate-800 bg-white">{val.label}</option>
                      ))}
                    </select>
                 </div>
               </div>
               
               <div className="flex flex-wrap items-center gap-3 mb-4">
                 <span className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                   所属项目: {getProjectName(bug.projectId)}
                 </span>
                 <span className={`text-xs font-medium px-2 py-1 rounded border ${priorityMap[bug.priority].color}`}>
                    优先级: {priorityMap[bug.priority].label}
                 </span>
                 {bug.assignee && (
                   <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                     <User size={12} className="mr-1" /> {bug.assignee}
                   </span>
                 )}
               </div>

               <div>
                 <p className="text-sm font-medium text-slate-700 mb-1 flex items-center"><AlignLeft size={14} className="mr-1"/> 复现步骤:</p>
                 <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm text-slate-600 whitespace-pre-wrap font-mono">
                   {bug.steps || '未提供复现步骤'}
                 </div>
               </div>
             </div>
          ))}
          {bugs.length === 0 && (
            <div className="text-center py-20 text-slate-400">目前没有记录任何 Bug 🎉</div>
          )}
        </div>

        {bugModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
                <h3 className="font-bold text-red-800 flex items-center"><Bug size={18} className="mr-2"/> {bugModal.isEdit ? '编辑 Bug' : '提交 Bug'}</h3>
                <button onClick={() => setBugModal({ isOpen: false, isEdit: false, data: {} })}><X size={20} className="text-red-400 hover:text-red-600" /></button>
              </div>
              <form onSubmit={handleSaveBug} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bug 标题 *</label>
                  <input required value={bugModal.data.title} onChange={e => setBugModal({ ...bugModal, data: { ...bugModal.data, title: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-red-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">所属项目 *</label>
                    <select required value={bugModal.data.projectId} onChange={e => setBugModal({ ...bugModal, data: { ...bugModal.data, projectId: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-red-500">
                      <option value="" disabled>选择项目...</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">指派给</label>
                    <input value={bugModal.data.assignee || ''} onChange={e => setBugModal({ ...bugModal, data: { ...bugModal.data, assignee: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-red-500" placeholder="处理人姓名" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">复现步骤 *</label>
                  <textarea required rows="4" value={bugModal.data.steps} onChange={e => setBugModal({ ...bugModal, data: { ...bugModal.data, steps: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-red-500 outline-none font-mono text-sm" placeholder="1. 打开页面...&#10;2. 点击按钮...&#10;3. 预期结果... 实际结果..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">严重程度</label>
                    <select value={bugModal.data.severity} onChange={e => setBugModal({ ...bugModal, data: { ...bugModal.data, severity: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-red-500">
                      {Object.entries(severityMap).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
                    <select value={bugModal.data.priority} onChange={e => setBugModal({ ...bugModal, data: { ...bugModal.data, priority: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-red-500">
                      <option value="high">高</option><option value="medium">中</option><option value="low">低</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                    <select value={bugModal.data.status} onChange={e => setBugModal({ ...bugModal, data: { ...bugModal.data, status: e.target.value } })} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-red-500">
                      {Object.entries(bugStatusMap).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setBugModal({ isOpen: false, isEdit: false, data: {} })} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded">取消</button>
                  <button type="submit" className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded">{bugModal.isEdit ? '保存更改' : '提交 Bug'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMembers = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">成员管理</h1>
          <p className="text-slate-500 text-sm">管理系统账户与权限 (仅管理员可用)</p>
        </div>
        <button 
          onClick={() => setUserModal({ isOpen: true, username: '', password: '', role: 'user' })}
          className="bg-[#0052cc] hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center font-medium transition-colors text-sm"
        >
          <Plus size={16} className="mr-1" /> 新增账户
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
              <th className="font-medium py-3 px-4 w-1/3">用户名</th>
              <th className="font-medium py-3 px-4 w-1/3">角色</th>
              <th className="font-medium py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 text-sm font-medium text-slate-800">{user.username}</td>
                <td className="py-4 px-4 text-sm text-slate-600">
                  <span className={`text-xs px-2 py-0.5 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {user.role === 'admin' ? '管理员' : '普通成员'}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  {user.username !== 'root' && (
                     <button onClick={() => {
                       if(window.confirm('确认删除该用户吗？')) {
                         setUsers(users.filter(u => u.id !== user.id));
                       }
                     }} className="text-red-500 hover:text-red-700 text-sm">删除</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">新增账户</h3>
              <button onClick={() => setUserModal({ isOpen: false, username: '', password: '', role: 'user' })}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">用户名 *</label>
                <input required value={userModal.username} onChange={e => setUserModal({ ...userModal, username: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none" placeholder="输入登录账号" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">初始密码 *</label>
                <input required type="password" value={userModal.password} onChange={e => setUserModal({ ...userModal, password: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none" placeholder="设置初始密码" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">账户角色</label>
                <select value={userModal.role} onChange={e => setUserModal({ ...userModal, role: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-blue-500">
                  <option value="user">普通成员</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setUserModal({ isOpen: false, username: '', password: '', role: 'user' })} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded">取消</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">创建账户</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderLogin = () => (
    <div className="flex h-screen w-screen bg-slate-50 items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <LayoutDashboard size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">欢迎登录 ZenFlow</h1>
        <p className="text-center text-slate-500 text-sm mb-8">轻量级团队项目管理工具</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="请输入用户名" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required type="password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="请输入密码" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2">
            登录
          </button>
        </form>
      </div>
    </div>
  );

  if (!currentUser) {
    return renderLogin();
  }

  return (
    <div className="flex h-screen bg-[#f4f5f7] font-sans overflow-hidden text-slate-800">
      {/* 侧边栏 */}
      <div className="w-[240px] bg-[#001529] text-slate-300 flex flex-col z-10 flex-shrink-0">
        <div className="h-16 flex items-center px-6 mb-4">
          <div className="text-white font-bold text-xl flex items-center tracking-wide">
             <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-2 shadow-lg shadow-blue-600/20">
                <LayoutDashboard size={18} className="text-white" />
             </div>
             ZenFlow
          </div>
        </div>
        <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', name: '概览', icon: <LayoutDashboard size={18} /> },
            { id: 'projects', name: '项目', icon: <FolderKanban size={18} /> },
            { id: 'requirements', name: '需求', icon: <ListTodo size={18} /> },
            { id: 'tasks', name: '任务', icon: <CheckSquare size={18} /> },
            { id: 'bugs', name: 'Bug', icon: <Bug size={18} /> },
            ...(currentUser.role === 'admin' ? [{ id: 'members', name: '成员', icon: <Users size={18} /> }] : []),
          ].map((menu) => (
            <button key={menu.id} onClick={() => setActiveMenu(menu.id)} className={`w-full flex items-center px-3 py-2.5 rounded transition-all duration-200 group ${activeMenu === menu.id ? 'bg-[#1677ff] text-white font-medium' : 'hover:bg-[#ffffff14] hover:text-white'}`}>
              <span className={`mr-3 ${activeMenu === menu.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{menu.icon}</span>
              <span className="text-sm">{menu.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 bg-[#000c17]">
          <div className="px-2 mb-3">
            <p className="text-xs text-slate-500 mb-1">当前登录</p>
            <p className="text-sm text-slate-300 truncate font-medium flex items-center">
              {currentUser.username} 
              <span className="text-[10px] ml-2 px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">{currentUser.role === 'admin' ? '管理员' : '成员'}</span>
            </p>
          </div>
          <button onClick={() => setPwdModal({ isOpen: true, oldPwd: '', newPwd: '', confirmPwd: '' })} className="w-full flex items-center px-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors mb-1">
            <KeyRound size={16} className="mr-2" /> 修改密码
          </button>
          <button onClick={handleLogout} className="w-full flex items-center px-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors">
            <LogOut size={16} className="mr-2" /> 退出登录
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="p-8 max-w-[1400px] mx-auto h-full">
          {activeMenu === 'overview' && renderOverview()}
          {activeMenu === 'projects' && renderProjects()}
          {activeMenu === 'requirements' && renderRequirements()}
          {activeMenu === 'tasks' && renderTasks()}
          {activeMenu === 'bugs' && renderBugs()}
          {activeMenu === 'members' && currentUser.role === 'admin' && renderMembers()}
        </div>

        {/* 修改密码 Modal */}
        {pwdModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">修改密码</h3>
                <button onClick={() => setPwdModal({ isOpen: false, oldPwd: '', newPwd: '', confirmPwd: '' })}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
              </div>
              <form onSubmit={handleChangePwd} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">原密码</label>
                  <input required type="password" value={pwdModal.oldPwd} onChange={e => setPwdModal({ ...pwdModal, oldPwd: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">新密码</label>
                  <input required type="password" value={pwdModal.newPwd} onChange={e => setPwdModal({ ...pwdModal, newPwd: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">确认新密码</label>
                  <input required type="password" value={pwdModal.confirmPwd} onChange={e => setPwdModal({ ...pwdModal, confirmPwd: e.target.value })} className="w-full border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none" />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setPwdModal({ isOpen: false, oldPwd: '', newPwd: '', confirmPwd: '' })} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded">取消</button>
                  <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded">确认修改</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}