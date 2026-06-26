'use client';

import React, { useEffect, useState } from 'react';
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
  GripVertical,
  Edit,
  Trash2,
  AlignLeft,
  User,
  Users,
  KeyRound,
  Lock,
  Menu,
  X,
  Inbox,
  Archive,
  ArchiveRestore,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { FieldError } from '@/components/ui/FieldError';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';

const API_ENDPOINTS = {
  data: '/api/data',
  users: '/api/users',
  projects: '/api/projects',
  requirements: '/api/requirements',
  tasks: '/api/tasks',
  bugs: '/api/bugs',
  login: '/api/auth/login',
  password: '/api/auth/password',
};

const ZENFLOW_SESSION_KEY = 'zenflow-session';
const REQUIREMENT_ATTACHMENT_MAX_FILES = 5;
const REQUIREMENT_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;
const BUG_ATTACHMENT_MAX_FILES = 10;
const BUG_ATTACHMENT_MAX_SIZE = 100 * 1024 * 1024;
const REQUIREMENT_TYPE_OPTIONS = ['功能不完善', '设计缺陷', '高阶功能'];
const IMPORTANCE_OPTIONS = ['重要', '一般'];
const URGENCY_OPTIONS = ['紧急', '非紧急'];

const createRequirementFormData = (projectId = '') => ({
  title: '',
  description: '',
  stakeholder: '',
  module: '',
  requirementType: '功能不完善',
  importance: '重要',
  urgency: '非紧急',
  devReply: '',
  solution: '',
  milestone: '',
  result: '',
  remark: '',
  projectId,
  priority: 'medium',
  status: 'draft',
  attachments: [],
});

const clearanceViewOptions = [
  { id: 'all', label: '全部' },
  { id: 'pendingReply', label: '待研发回复' },
  { id: 'urgent', label: '紧急事项' },
  { id: 'open', label: '未消项' },
  { id: 'advanced', label: '高阶功能' },
];

const formatFileSize = (size) => {
  if (!Number.isFinite(size)) return '';
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

const fileToAttachment = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
      });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || '\u8bf7\u6c42\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5');
  }
  return data;
};

const saveRecord = (collection, payload, id) =>
  requestJson(id ? `${collection}/${id}` : collection, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });

const deleteRecord = (collection, id) =>
  requestJson(`${collection}/${id}`, { method: 'DELETE' });

export default function App() {
  // --- 1. 全局数据状态（接入 localStorage 持久化） ---
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [activeMenu, setActiveMenu] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [projects, setProjects] = useState([]);

  const [requirements, setRequirements] = useState([]);

  const [tasks, setTasks] = useState([]);

  const [bugs, setBugs] = useState([]);

  // --- 2. 弹窗与表单状态管理 ---
  const [projectModal, setProjectModal] = useState({
    isOpen: false,
    isEdit: false,
    data: { name: '', description: '', status: 'planning' },
  });
  const [projectErrors, setProjectErrors] = useState({});

  const [reqModal, setReqModal] = useState({
    isOpen: false,
    isEdit: false,
    data: createRequirementFormData(),
  });
  const [reqErrors, setReqErrors] = useState({});
  const [reqFilter, setReqFilter] = useState({
    projectId: 'all',
    priority: 'all',
    status: 'all',
    clearanceView: 'all',
  });

  const [taskModal, setTaskModal] = useState({
    isOpen: false,
    isEdit: false,
    data: {
      title: '',
      description: '',
      projectId: '',
      priority: 'medium',
      assignee: '',
      startDate: '',
    },
  });
  const [taskErrors, setTaskErrors] = useState({});

  const [bugModal, setBugModal] = useState({
    isOpen: false,
    isEdit: false,
    data: {
      title: '',
      projectId: '',
      steps: '',
      priority: 'high',
      severity: 'major',
      assignee: '',
      status: 'open',
      attachments: [],
    },
  });
  const [bugErrors, setBugErrors] = useState({});

  const [pwdModal, setPwdModal] = useState({
    isOpen: false,
    oldPwd: '',
    newPwd: '',
    confirmPwd: '',
  });
  const [pwdErrors, setPwdErrors] = useState({});

  const [userModal, setUserModal] = useState({
    isOpen: false,
    username: '',
    password: '',
    role: 'user',
  });
  const [userErrors, setUserErrors] = useState({});

  const [loginData, setLoginData] = useState({ username: 'root', password: '1314520sm' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [loginError, setLoginError] = useState('');

  // 看板拖拽视觉反馈
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const clearStoredSession = () => {
    window.localStorage.removeItem(ZENFLOW_SESSION_KEY);
    setCurrentUser(null);
  };

  const persistSession = (session) => {
    window.localStorage.setItem(ZENFLOW_SESSION_KEY, JSON.stringify(session));
    setCurrentUser(session.user);
  };

  const loadData = async () => {
    setDataLoading(true);
    setDataError('');
    try {
      const data = await requestJson(API_ENDPOINTS.data);
      setUsers(data.users || []);
      setProjects(data.projects || []);
      setRequirements(data.requirements || []);
      setTasks(data.tasks || []);
      setBugs(data.bugs || []);
      return data;
    } catch (err) {
      const message = err.message || '\u6570\u636e\u52a0\u8f7d\u5931\u8d25';
      setDataError(message);
      toast.error(message);
      return null;
    } finally {
      setDataLoading(false);
    }
  };

  // 切换主菜单时收起移动端抽屉
  useEffect(() => {
    setMobileNavOpen(false);
  }, [activeMenu]);

  useEffect(() => {
    const raw = window.localStorage.getItem(ZENFLOW_SESSION_KEY);
    if (!raw) return;

    try {
      const session = JSON.parse(raw);
      if (!session?.user || session.expiresAt <= Date.now()) {
        window.localStorage.removeItem(ZENFLOW_SESSION_KEY);
        return;
      }
      setCurrentUser(session.user);
    } catch {
      window.localStorage.removeItem(ZENFLOW_SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser?.id]);

  // --- 3. 辅助函数 ---
  const getProjectName = (projectId) => {
    const p = projects.find((it) => it.id === projectId);
    return p ? p.name : '未知项目';
  };

  const renderAttachments = (
    attachments = [],
    { showMeta = false, canRemove = false, onRemove } = {},
  ) => {
    if (!attachments.length) return null;

    return (
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((attachment) => (
          <div
            key={attachment.id || attachment.name}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            {attachment.type?.startsWith('image/') ? (
              <img
                src={attachment.dataUrl}
                alt={attachment.name}
                className="h-40 w-full object-cover"
              />
            ) : attachment.type?.startsWith('video/') ? (
              <video
                src={attachment.dataUrl}
                controls
                className="h-40 w-full bg-slate-950 object-contain"
              />
            ) : null}
            <div className="flex items-start justify-between gap-2 p-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-700">
                  {attachment.name}
                </div>
                {showMeta && (
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {formatFileSize(attachment.size)}
                  </div>
                )}
              </div>
              {canRemove && (
                <button
                  type="button"
                  onClick={() => onRemove?.(attachment.id)}
                  className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                >
                  移除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleAttachmentChange = async (kind, fileList) => {
    const files = Array.from(fileList || []);
    const isBug = kind === 'bug';
    const maxFiles = isBug
      ? BUG_ATTACHMENT_MAX_FILES
      : REQUIREMENT_ATTACHMENT_MAX_FILES;
    const maxSize = isBug
      ? BUG_ATTACHMENT_MAX_SIZE
      : REQUIREMENT_ATTACHMENT_MAX_SIZE;
    const currentAttachments = isBug
      ? bugModal.data.attachments || []
      : [];

    if (files.length + currentAttachments.length > maxFiles) {
      toast.error(`最多上传 ${maxFiles} 个附件`);
      return;
    }

    const invalidFile = files.find(
      (file) =>
        file.size > maxSize ||
        !file.type.match(/^(image|video)\//),
    );
    if (invalidFile) {
      toast.error(`仅支持 ${formatFileSize(maxSize)} 以内的图片或视频`);
      return;
    }

    const attachments = await Promise.all(files.map(fileToAttachment));
    if (kind === 'requirement') {
      setReqModal({
        ...reqModal,
        data: { ...reqModal.data, attachments },
      });
      return;
    }

    setBugModal({
      ...bugModal,
      data: {
        ...bugModal.data,
        attachments: [
          ...(bugModal.data.attachments || []),
          ...attachments,
        ],
      },
    });
  };

  const removeAttachment = (kind, attachmentId) => {
    if (kind === 'bug') {
      setBugModal({
        ...bugModal,
        data: {
          ...bugModal.data,
          attachments: (bugModal.data.attachments || []).filter(
            (attachment) => attachment.id !== attachmentId,
          ),
        },
      });
    }
  };

  const closeProjectModal = () => {
    setProjectModal({ isOpen: false, isEdit: false, data: {} });
    setProjectErrors({});
  };
  const closeReqModal = () => {
    setReqModal({ isOpen: false, isEdit: false, data: {} });
    setReqErrors({});
  };
  const closeTaskModal = () => {
    setTaskModal({ isOpen: false, isEdit: false, data: {} });
    setTaskErrors({});
  };
  const closeBugModal = () => {
    setBugModal({ isOpen: false, isEdit: false, data: {} });
    setBugErrors({});
  };
  const closePwdModal = () => {
    setPwdModal({ isOpen: false, oldPwd: '', newPwd: '', confirmPwd: '' });
    setPwdErrors({});
  };
  const closeUserModal = () => {
    setUserModal({ isOpen: false, username: '', password: '', role: 'user' });
    setUserErrors({});
  };

  // --- 4. 业务处理函数 ---

  // 项目 CRUD
  const handleSaveProject = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!projectModal.data.name?.trim()) errors.name = '项目名称不能为空';
    if (Object.keys(errors).length) {
      setProjectErrors(errors);
      return;
    }

    if (projectModal.isEdit) {
      const savedProject = await saveRecord(
        API_ENDPOINTS.projects,
        projectModal.data,
        projectModal.data.id,
      );
      setProjects(
        projects.map((p) =>
          p.id === savedProject.id ? savedProject : p,
        ),
      );
      toast.success('项目已更新');
    } else {
      const savedProject = await saveRecord(
        API_ENDPOINTS.projects,
        projectModal.data,
      );
      setProjects([savedProject, ...projects]);
      toast.success('项目已创建');
    }
    closeProjectModal();
  };

  const handleDeleteProject = async (e, id) => {
    e.stopPropagation();
    const target = projects.find((p) => p.id === id);
    const ok = await confirm({
      title: '删除项目',
      description: `确定要删除「${target?.name ?? '该项目'}」吗？\n相关的需求和任务可能会失去关联。`,
      confirmText: '删除',
      tone: 'danger',
    });
    if (!ok) return;
    await deleteRecord(API_ENDPOINTS.projects, id);
    setProjects(projects.filter((p) => p.id !== id));
    setRequirements(requirements.filter((r) => r.projectId !== id));
    setTasks(tasks.filter((t) => t.projectId !== id));
    setBugs(bugs.filter((b) => b.projectId !== id));
    toast.success('项目已删除');
  };

  // 需求 CRUD
  const handleSaveRequirement = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!reqModal.data.title?.trim()) errors.title = '需求标题不能为空';
    if (!reqModal.data.projectId) errors.projectId = '请选择所属项目';
    if (Object.keys(errors).length) {
      setReqErrors(errors);
      return;
    }
    const savedRequirement = await saveRecord(
      API_ENDPOINTS.requirements,
      reqModal.data,
      reqModal.isEdit ? reqModal.data.id : undefined,
    );
    if (reqModal.isEdit) {
      setRequirements(
        requirements.map((r) =>
          r.id === savedRequirement.id ? savedRequirement : r,
        ),
      );
      toast.success('需求已更新');
    } else {
      setRequirements([savedRequirement, ...requirements]);
      toast.success('需求已创建');
    }
    closeReqModal();
  };

  const handleChangeReqStatus = async (reqId, newStatus) => {
    const target = requirements.find((r) => r.id === reqId);
    if (!target) return;
    const savedRequirement = await saveRecord(
      API_ENDPOINTS.requirements,
      { ...target, status: newStatus },
      reqId,
    );
    setRequirements(
      requirements.map((r) =>
        r.id === reqId ? savedRequirement : r,
      ),
    );
  };

  const handleDeleteRequirement = async (id) => {
    const target = requirements.find((r) => r.id === id);
    const ok = await confirm({
      title: '删除需求',
      description: `确定要删除「${target?.title ?? '该需求'}」吗？`,
      confirmText: '删除',
      tone: 'danger',
    });
    if (!ok) return;
    await deleteRecord(API_ENDPOINTS.requirements, id);
    setRequirements(requirements.filter((r) => r.id !== id));
    toast.success('需求已删除');
  };

  // 任务 CRUD
  const handleSaveTask = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!taskModal.data.title?.trim()) errors.title = '任务名称不能为空';
    if (!taskModal.data.projectId) errors.projectId = '请选择所属项目';
    if (Object.keys(errors).length) {
      setTaskErrors(errors);
      return;
    }
    if (taskModal.isEdit) {
      const savedTask = await saveRecord(
        API_ENDPOINTS.tasks,
        taskModal.data,
        taskModal.data.id,
      );
      setTasks(
        tasks.map((t) =>
          t.id === savedTask.id ? savedTask : t,
        ),
      );
      toast.success('任务已更新');
    } else {
      const savedTask = await saveRecord(API_ENDPOINTS.tasks, {
        ...taskModal.data,
        status: 'todo',
      });
      setTasks([...tasks, savedTask]);
      toast.success('任务已创建');
    }
    closeTaskModal();
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };
  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };
  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const targetTask = tasks.find((task) => task.id === taskId);
    if (!targetTask) return;
    const savedTask = await saveRecord(
      API_ENDPOINTS.tasks,
      { ...targetTask, status: targetStatus },
      taskId,
    );
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? savedTask : task,
      ),
    );
    setDragOverColumn(null);
    setDraggingTaskId(null);
  };

  // 通过按钮直接切换任务状态（归档 / 恢复时使用）
  const handleChangeTaskStatus = async (taskId, newStatus) => {
    const targetTask = tasks.find((task) => task.id === taskId);
    if (!targetTask) return;
    const savedTask = await saveRecord(
      API_ENDPOINTS.tasks,
      { ...targetTask, status: newStatus },
      taskId,
    );
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? savedTask : task,
      ),
    );
    if (newStatus === 'archived') {
      toast.success('任务已归档');
    } else {
      toast.success('已恢复任务');
    }
  };

  const handleDeleteTask = async (id) => {
    const target = tasks.find((t) => t.id === id);
    const ok = await confirm({
      title: '删除任务',
      description: `确定要删除「${target?.title ?? '该任务'}」吗？`,
      confirmText: '删除',
      tone: 'danger',
    });
    if (!ok) return;
    await deleteRecord(API_ENDPOINTS.tasks, id);
    setTasks(tasks.filter((t) => t.id !== id));
    toast.success('任务已删除');
  };

  // Bug CRUD
  const handleSaveBug = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!bugModal.data.title?.trim()) errors.title = 'Bug 标题不能为空';
    if (!bugModal.data.projectId) errors.projectId = '请选择所属项目';
    if (!bugModal.data.steps?.trim()) errors.steps = '请填写复现步骤';
    if (Object.keys(errors).length) {
      setBugErrors(errors);
      return;
    }
    if (bugModal.isEdit) {
      const savedBug = await saveRecord(
        API_ENDPOINTS.bugs,
        bugModal.data,
        bugModal.data.id,
      );
      setBugs(
        bugs.map((b) =>
          b.id === savedBug.id ? savedBug : b,
        ),
      );
      toast.success('Bug 已更新');
    } else {
      const savedBug = await saveRecord(API_ENDPOINTS.bugs, {
        ...bugModal.data,
        status: bugModal.data.status || 'open',
      });
      setBugs([savedBug, ...bugs]);
      toast.success('Bug 已提交');
    }
    closeBugModal();
  };

  const handleChangeBugStatus = async (bugId, newStatus) => {
    const targetBug = bugs.find((b) => b.id === bugId);
    if (!targetBug) return;
    const savedBug = await saveRecord(
      API_ENDPOINTS.bugs,
      { ...targetBug, status: newStatus },
      bugId,
    );
    setBugs(bugs.map((b) => (b.id === bugId ? savedBug : b)));
  };

  const handleDeleteBug = async (id) => {
    const target = bugs.find((b) => b.id === id);
    const ok = await confirm({
      title: '删除 Bug',
      description: `确定要删除「${target?.title ?? '该 Bug'}」吗？`,
      confirmText: '删除',
      tone: 'danger',
    });
    if (!ok) return;
    await deleteRecord(API_ENDPOINTS.bugs, id);
    setBugs(bugs.filter((b) => b.id !== id));
    toast.success('Bug 已删除');
  };

  // --- 账户与权限控制 ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const session = await requestJson(API_ENDPOINTS.login, {
        method: 'POST',
        body: JSON.stringify(loginData),
      });
      persistSession(session);
      const user = session.user;
      setActiveMenu('overview');
      toast.success(`欢迎回来，${user.username}`);
    } catch (err) {
      setLoginError(err.message || '\u767b\u5f55\u5931\u8d25');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwdModal.oldPwd) errors.oldPwd = '请输入原密码';
    if (!pwdModal.newPwd) errors.newPwd = '请输入新密码';
    else if (pwdModal.newPwd.length < 6)
      errors.newPwd = '新密码至少 6 个字符';
    if (pwdModal.newPwd !== pwdModal.confirmPwd)
      errors.confirmPwd = '两次输入的新密码不一致';
    if (Object.keys(errors).length) {
      setPwdErrors(errors);
      return;
    }
    const nextUsername = currentUser.username;
    try {
      await requestJson(API_ENDPOINTS.password, {
        method: 'POST',
        body: JSON.stringify({
          userId: currentUser.id,
          oldPassword: pwdModal.oldPwd,
          newPassword: pwdModal.newPwd,
        }),
      });
    } catch (err) {
      setPwdErrors({ oldPwd: err.message || '\u539f\u5bc6\u7801\u9519\u8bef' });
      return;
    }
    closePwdModal();
    setLoginData({ username: nextUsername, password: '' });
    setActiveMenu('overview');
    clearStoredSession();
    toast.success('密码修改成功');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!userModal.username?.trim()) errors.username = '请输入用户名';
    else if (users.find((u) => u.username === userModal.username))
      errors.username = '用户名已存在';
    if (!userModal.password) errors.password = '请输入初始密码';
    else if (userModal.password.length < 6)
      errors.password = '密码至少 6 个字符';
    if (Object.keys(errors).length) {
      setUserErrors(errors);
      return;
    }
    const savedUser = await requestJson(API_ENDPOINTS.users, {
      method: 'POST',
      body: JSON.stringify(userModal),
    });
    setUsers([...users, savedUser]);
    closeUserModal();
    toast.success('账户创建成功');
  };

  const handleDeleteUser = async (user) => {
    const ok = await confirm({
      title: '删除用户',
      description: `确定要删除用户「${user.username}」吗？`,
      confirmText: '删除',
      tone: 'danger',
    });
    if (!ok) return;
    await deleteRecord(API_ENDPOINTS.users, user.id);
    setUsers(users.filter((u) => u.id !== user.id));
    toast.success('用户已删除');
  };

  // --- 5. 视图渲染 ---

  // 配置常量
  const projectStatusMap = {
    planning: { label: '规划中', color: 'bg-slate-100 text-slate-500' },
    active: { label: '进行中', color: 'bg-[#e6f4ff] text-[#096dd9]' },
    paused: { label: '暂停', color: 'bg-amber-50 text-amber-600' },
    completed: { label: '已完成', color: 'bg-green-50 text-green-600' },
  };

  const reqStatusMap = {
    draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
    active: { label: '激活', color: 'bg-blue-50 text-blue-600' },
    developing: { label: '开发中', color: 'bg-[#e6f4ff] text-[#096dd9]' },
    tested: { label: '已测', color: 'bg-purple-50 text-purple-600' },
    released: { label: '已发布', color: 'bg-green-50 text-green-600' },
    closed: { label: '关闭', color: 'bg-red-50 text-red-600' },
  };

  const priorityMap = {
    high: { label: '高', color: 'text-red-500 bg-red-50 border-red-100' },
    medium: {
      label: '中',
      color: 'text-[#096dd9] bg-[#e6f4ff] border-[#91caff]',
    },
    low: { label: '低', color: 'text-slate-500 bg-slate-50 border-slate-200' },
  };

  // 输入框公共样式：根据是否报错切换边框色。
  // 使用静态分支而非字符串拼接，避免被 Tailwind 静态扫描漏掉。
  const inputBase =
    'w-full border rounded px-3 py-2 outline-none transition-colors focus:ring-1';
  const inputClass = (hasError, accent = 'blue') => {
    if (hasError) {
      return `${inputBase} border-red-400 focus:border-red-500 focus:ring-red-200`;
    }
    if (accent === 'red') {
      return `${inputBase} border-slate-300 focus:border-red-500 focus:ring-red-200`;
    }
    return `${inputBase} border-slate-300 focus:border-blue-500 focus:ring-blue-200`;
  };

  const renderOverview = () => {
    const unresolvedBugs = bugs.filter(
      (b) => b.status === 'open' || b.status === 'fixing',
    );
    const doingTasks = tasks.filter((t) => t.status === 'doing');
    const recentProjects = [...projects].reverse().slice(0, 5);
    const highPriorityBugs = unresolvedBugs.filter(
      (b) =>
        b.priority === 'high' ||
        b.severity === 'critical' ||
        b.severity === 'major',
    );

    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">工作台</h1>
          <p className="text-slate-500 text-sm">团队当前进展一览</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              key: 'projects',
              label: '项目总数',
              count: projects.length,
              icon: <FolderKanban size={24} />,
              iconWrap: 'bg-blue-50 text-blue-600',
              hoverText: 'group-hover:text-blue-600',
            },
            {
              key: 'requirements',
              label: '需求总数',
              count: requirements.length,
              icon: <ClipboardList size={24} />,
              iconWrap: 'bg-cyan-50 text-cyan-600',
              hoverText: 'group-hover:text-cyan-600',
            },
            {
              key: 'tasks',
              label: '进行中任务',
              count: doingTasks.length,
              icon: <CheckSquare size={24} />,
              iconWrap: 'bg-amber-50 text-amber-600',
              hoverText: 'group-hover:text-amber-600',
            },
            {
              key: 'bugs',
              label: '未解决 BUG',
              count: unresolvedBugs.length,
              icon: <Bug size={24} />,
              iconWrap: 'bg-red-50 text-red-600',
              hoverText: 'group-hover:text-red-600',
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveMenu(item.key)}
              className="group text-left bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm mb-1">{item.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800">
                    {item.count}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${item.iconWrap}`}>
                  {item.icon}
                </div>
              </div>
              <div
                className={`mt-4 flex items-center text-sm text-slate-400 ${item.hoverText} transition-colors`}
              >
                查看详情 <ArrowRight size={14} className="ml-1" />
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col max-h-[400px]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">最近项目</h2>
              <button
                className="text-blue-600 text-sm hover:underline"
                onClick={() => setActiveMenu('projects')}
              >
                全部
              </button>
            </div>
            <div className="p-2 overflow-y-auto">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => setActiveMenu('projects')}
                >
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {project.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      ID: {project.id}
                    </span>
                  </div>
                  <span
                    className={`${projectStatusMap[project.status].color} text-xs px-2.5 py-1 rounded-full font-medium`}
                  >
                    {projectStatusMap[project.status].label}
                  </span>
                </div>
              ))}
              {recentProjects.length === 0 && (
                <EmptyState
                  icon={<FolderKanban size={20} />}
                  title="暂无项目"
                  description="点击右上角“新建项目”开始记录团队工作。"
                />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col max-h-[400px]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 flex items-center">
                高优待办 Bug
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {highPriorityBugs.length}
                </span>
              </h2>
              <button
                className="text-blue-600 text-sm hover:underline"
                onClick={() => setActiveMenu('bugs')}
              >
                全部
              </button>
            </div>
            <div className="p-2 overflow-y-auto">
              {highPriorityBugs.map((bug) => (
                <div
                  key={bug.id}
                  className="flex flex-col p-4 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                  onClick={() => setActiveMenu('bugs')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-800 text-sm">
                      {bug.title}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                      {getProjectName(bug.projectId)}
                    </span>
                    <span className="flex items-center text-blue-600">
                      <User size={12} className="mr-1" />{' '}
                      {bug.assignee || '未指派'}
                    </span>
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
      <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">项目</h1>
          <p className="text-slate-500 text-sm">管理团队所有项目</p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() =>
            setProjectModal({
              isOpen: true,
              isEdit: false,
              data: { name: '', description: '', status: 'planning' },
            })
          }
        >
          新建项目
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={24} />}
          title="还没有项目"
          description="创建第一个项目，把需求、任务、Bug 都串起来。"
          action={
            <Button
              icon={<Plus size={16} />}
              onClick={() =>
                setProjectModal({
                  isOpen: true,
                  isEdit: false,
                  data: { name: '', description: '', status: 'planning' },
                })
              }
            >
              新建项目
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between h-48 relative group"
            >
              <div className="flex justify-between items-start">
                <div className="bg-blue-50 p-2 rounded text-blue-500">
                  <FolderGit2 size={24} />
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`${projectStatusMap[project.status].color} text-xs px-2.5 py-1 rounded-full font-medium`}
                  >
                    {projectStatusMap[project.status].label}
                  </span>
                  <div className="hidden group-hover:flex space-x-1 bg-white shadow-sm border border-slate-100 rounded p-1 absolute top-4 right-4">
                    <IconButton
                      label="编辑项目"
                      onClick={() =>
                        setProjectModal({
                          isOpen: true,
                          isEdit: true,
                          data: project,
                        })
                      }
                    >
                      <Edit size={14} />
                    </IconButton>
                    <IconButton
                      label="删除项目"
                      tone="danger"
                      onClick={(e) => handleDeleteProject(e, project.id)}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex-1">
                <span className="text-xs text-slate-400 block mb-1">
                  ID: {project.id}
                </span>
                <h3 className="font-bold text-slate-800 text-lg line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                  {project.description || '暂无描述'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={projectModal.isOpen}
        onClose={closeProjectModal}
        title={projectModal.isEdit ? '编辑项目' : '新建项目'}
      >
        <form onSubmit={handleSaveProject} className="p-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              项目名称 *
            </label>
            <input
              value={projectModal.data.name || ''}
              onChange={(e) =>
                setProjectModal({
                  ...projectModal,
                  data: { ...projectModal.data, name: e.target.value },
                })
              }
              aria-invalid={!!projectErrors.name}
              aria-describedby={
                projectErrors.name ? 'project-name-err' : undefined
              }
              className={inputClass(!!projectErrors.name)}
            />
            <FieldError id="project-name-err" message={projectErrors.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              项目描述
            </label>
            <textarea
              rows="3"
              value={projectModal.data.description || ''}
              onChange={(e) =>
                setProjectModal({
                  ...projectModal,
                  data: { ...projectModal.data, description: e.target.value },
                })
              }
              className={inputClass(false)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              项目状态
            </label>
            <select
              value={projectModal.data.status || 'planning'}
              onChange={(e) =>
                setProjectModal({
                  ...projectModal,
                  data: { ...projectModal.data, status: e.target.value },
                })
              }
              className={inputClass(false)}
            >
              {Object.entries(projectStatusMap).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeProjectModal}>
              取消
            </Button>
            <Button type="submit">保存</Button>
          </div>
        </form>
      </Modal>
    </div>
  );

  const renderRequirements = () => {
    const filteredRequirements = requirements.filter((req) => {
      const isRequirementCleared = Boolean(req.result?.trim());
      const matchClearanceView = (() => {
        if (reqFilter.clearanceView === 'pendingReply') {
          return !req.devReply?.trim() && !isRequirementCleared;
        }
        if (reqFilter.clearanceView === 'urgent') {
          return req.urgency === '紧急' && !isRequirementCleared;
        }
        if (reqFilter.clearanceView === 'open') {
          return !isRequirementCleared;
        }
        if (reqFilter.clearanceView === 'advanced') {
          return req.requirementType === '高阶功能';
        }
        return true;
      })();
      const matchProject =
        reqFilter.projectId === 'all' || req.projectId === reqFilter.projectId;
      const matchPriority =
        reqFilter.priority === 'all' || req.priority === reqFilter.priority;
      const matchStatus =
        reqFilter.status === 'all' || req.status === reqFilter.status;
      return matchClearanceView && matchProject && matchPriority && matchStatus;
    });

    return (
      <div className="animate-in fade-in duration-300 h-full flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">需求池</h1>
            <p className="text-slate-500 text-sm">跨项目的需求/Story 全景</p>
          </div>
          <Button
            icon={<Plus size={16} />}
            onClick={() =>
              setReqModal({
                isOpen: true,
                isEdit: false,
                data: createRequirementFormData(projects[0]?.id || ''),
              })
            }
          >
            新建需求
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <div className="flex flex-wrap gap-2">
            {clearanceViewOptions.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() =>
                  setReqFilter({ ...reqFilter, clearanceView: view.id })
                }
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  reqFilter.clearanceView === view.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          <select
            value={reqFilter.projectId}
            onChange={(e) =>
              setReqFilter({ ...reqFilter, projectId: e.target.value })
            }
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white min-w-[150px]"
          >
            <option value="all">全部项目</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={reqFilter.priority}
            onChange={(e) =>
              setReqFilter({ ...reqFilter, priority: e.target.value })
            }
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white min-w-[120px]"
          >
            <option value="all">所有优先级</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>

          <select
            value={reqFilter.status}
            onChange={(e) =>
              setReqFilter({ ...reqFilter, status: e.target.value })
            }
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white min-w-[120px]"
          >
            <option value="all">所有状态</option>
            {Object.entries(reqStatusMap).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          {(reqFilter.projectId !== 'all' ||
            reqFilter.priority !== 'all' ||
            reqFilter.status !== 'all' ||
            reqFilter.clearanceView !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setReqFilter({
                  projectId: 'all',
                  priority: 'all',
                  status: 'all',
                  clearanceView: 'all',
                })
              }
            >
              重置筛选
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="font-medium py-3 px-4 min-w-[260px]">标题</th>
                <th className="font-medium py-3 px-4 w-32">模块</th>
                <th className="font-medium py-3 px-4 w-40">项目</th>
                <th className="font-medium py-3 px-4 w-32 text-center">
                  需求类型
                </th>
                <th className="font-medium py-3 px-4 w-28 text-center">
                  紧急程度
                </th>
                <th className="font-medium py-3 px-4 w-32 text-center">
                  状态
                </th>
                <th className="font-medium py-3 px-4 min-w-[160px]">
                  研发回复
                </th>
                <th className="font-medium py-3 px-4 min-w-[140px]">
                  处理结果
                </th>
                <th className="font-medium py-3 px-4 w-40 text-center">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.map((req) => (
                <tr
                  key={req.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-4 text-sm font-medium text-slate-800">
                    <div>{req.title}</div>
                    {req.stakeholder && (
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center">
                        <User size={11} className="mr-1" />
                        需求方：{req.stakeholder}
                      </div>
                    )}
                    {req.description && (
                      <p className="mt-2 text-xs font-normal leading-relaxed text-slate-500 whitespace-pre-wrap">
                        {req.description}
                      </p>
                    )}
                    {renderAttachments(req.attachments)}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {req.module || '-'}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {getProjectName(req.projectId)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${priorityMap[req.priority]?.color || priorityMap.medium.color}`}
                    >
                      {req.requirementType || priorityMap[req.priority]?.label || '中'}
                    </span>
                    {req.importance && (
                      <div className="mt-1 text-[11px] text-slate-400">
                        {req.importance}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        req.urgency === '紧急'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {req.urgency || '未设置'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${reqStatusMap[req.status].color}`}
                    >
                      {reqStatusMap[req.status].label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {req.devReply || '-'}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {req.result || '-'}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <IconButton
                        label="编辑需求"
                        onClick={() =>
                          setReqModal({
                            isOpen: true,
                            isEdit: true,
                            data: {
                              ...createRequirementFormData(req.projectId),
                              ...req,
                            },
                          })
                        }
                      >
                        <Edit size={14} />
                      </IconButton>
                      <select
                        value={req.status}
                        onChange={(e) =>
                          handleChangeReqStatus(req.id, e.target.value)
                        }
                        aria-label={`修改需求 ${req.title} 的状态`}
                        className="text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 bg-white"
                      >
                        {Object.entries(reqStatusMap).map(([key, val]) => (
                          <option key={key} value={key}>
                            {val.label}
                          </option>
                        ))}
                      </select>
                      <IconButton
                        label="删除需求"
                        tone="danger"
                        onClick={() => handleDeleteRequirement(req.id)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequirements.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-2">
                    <EmptyState
                      icon={<Inbox size={22} />}
                      title={
                        requirements.length === 0
                          ? '需求池还是空的'
                          : '没有符合条件的需求'
                      }
                      description={
                        requirements.length === 0
                          ? '点击右上角“新建需求”，开始沉淀团队 Story。'
                          : '试试调整筛选条件或重置筛选。'
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal
          open={reqModal.isOpen}
          onClose={closeReqModal}
          title={reqModal.isEdit ? '编辑需求' : '新建需求'}
          size="md"
        >
          <form
            onSubmit={handleSaveRequirement}
            className="p-6 space-y-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                需求标题 *
              </label>
              <input
                value={reqModal.data.title || ''}
                onChange={(e) =>
                  setReqModal({
                    ...reqModal,
                    data: { ...reqModal.data, title: e.target.value },
                  })
                }
                aria-invalid={!!reqErrors.title}
                aria-describedby={reqErrors.title ? 'req-title-err' : undefined}
                className={inputClass(!!reqErrors.title)}
              />
              <FieldError id="req-title-err" message={reqErrors.title} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                所属项目 *
              </label>
              <select
                value={reqModal.data.projectId || ''}
                onChange={(e) =>
                  setReqModal({
                    ...reqModal,
                    data: { ...reqModal.data, projectId: e.target.value },
                  })
                }
                aria-invalid={!!reqErrors.projectId}
                aria-describedby={
                  reqErrors.projectId ? 'req-project-err' : undefined
                }
                className={inputClass(!!reqErrors.projectId)}
              >
                <option value="" disabled>
                  选择项目...
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <FieldError
                id="req-project-err"
                message={reqErrors.projectId}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  模块
                </label>
                <input
                  value={reqModal.data.module || ''}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: { ...reqModal.data, module: e.target.value },
                    })
                  }
                  placeholder="例如：流程可被打断"
                  className={inputClass(false)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  需求类型
                </label>
                <select
                  value={reqModal.data.requirementType || '功能不完善'}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: {
                        ...reqModal.data,
                        requirementType: e.target.value,
                      },
                    })
                  }
                  className={inputClass(false)}
                >
                  {REQUIREMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  重要程度
                </label>
                <select
                  value={reqModal.data.importance || '重要'}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: { ...reqModal.data, importance: e.target.value },
                    })
                  }
                  className={inputClass(false)}
                >
                  {IMPORTANCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  紧急程度
                </label>
                <select
                  value={reqModal.data.urgency || '非紧急'}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: { ...reqModal.data, urgency: e.target.value },
                    })
                  }
                  className={inputClass(false)}
                >
                  {URGENCY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                需求方
              </label>
              <input
                value={reqModal.data.stakeholder || ''}
                onChange={(e) =>
                  setReqModal({
                    ...reqModal,
                    data: { ...reqModal.data, stakeholder: e.target.value },
                  })
                }
                placeholder="例如：产品-张三、业务方-某客户"
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                需求描述
              </label>
              <textarea
                rows="3"
                value={reqModal.data.description || ''}
                onChange={(e) =>
                  setReqModal({
                    ...reqModal,
                    data: { ...reqModal.data, description: e.target.value },
                  })
                }
                placeholder="补充背景、目标与验收标准..."
                className={inputClass(false)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  研发回复
                </label>
                <textarea
                  rows="3"
                  value={reqModal.data.devReply || ''}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: { ...reqModal.data, devReply: e.target.value },
                    })
                  }
                  placeholder="记录研发侧答复..."
                  className={inputClass(false)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  解决方案
                </label>
                <textarea
                  rows="3"
                  value={reqModal.data.solution || ''}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: { ...reqModal.data, solution: e.target.value },
                    })
                  }
                  placeholder="记录拟定方案..."
                  className={inputClass(false)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  时间节点
                </label>
                <input
                  value={reqModal.data.milestone || ''}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: { ...reqModal.data, milestone: e.target.value },
                    })
                  }
                  placeholder="例如：本周测试"
                  className={inputClass(false)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  处理结果
                </label>
                <input
                  value={reqModal.data.result || ''}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: { ...reqModal.data, result: e.target.value },
                    })
                  }
                  placeholder="填写后视为已消项"
                  className={inputClass(false)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                备注
              </label>
              <textarea
                rows="2"
                value={reqModal.data.remark || ''}
                onChange={(e) =>
                  setReqModal({
                    ...reqModal,
                    data: { ...reqModal.data, remark: e.target.value },
                  })
                }
                placeholder="补充消项过程中的其他信息..."
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                附件（图片/视频）
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) =>
                  handleAttachmentChange('requirement', e.target.files)
                }
                className={inputClass(false)}
              />
              {renderAttachments(reqModal.data.attachments)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  优先级
                </label>
                <select
                  value={reqModal.data.priority || 'medium'}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: { ...reqModal.data, priority: e.target.value },
                    })
                  }
                  className={inputClass(false)}
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  初始状态
                </label>
                <select
                  value={reqModal.data.status || 'draft'}
                  onChange={(e) =>
                    setReqModal({
                      ...reqModal,
                      data: { ...reqModal.data, status: e.target.value },
                    })
                  }
                  className={inputClass(false)}
                >
                  {Object.entries(reqStatusMap).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={closeReqModal}>
                取消
              </Button>
              <Button type="submit">{reqModal.isEdit ? '保存更改' : '创建'}</Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  };

  const renderTasks = () => {
    const columns = [
      { id: 'todo', title: '待办事项', color: 'slate' },
      { id: 'doing', title: '进行中', color: 'blue' },
      { id: 'done', title: '已完成', color: 'green' },
      { id: 'archived', title: '已归档', color: 'amber' },
    ];

    return (
      <div className="animate-in fade-in duration-300 h-full flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">任务看板</h1>
            <p className="text-slate-500 text-sm">
              拖拽更改状态，双击卡片进行编辑
            </p>
          </div>
          <Button
            icon={<Plus size={16} />}
            onClick={() =>
              setTaskModal({
                isOpen: true,
                isEdit: false,
                data: {
                  title: '',
                  description: '',
                  projectId: projects[0]?.id || '',
                  priority: 'medium',
                  assignee: '',
                  startDate: '',
                },
              })
            }
          >
            新建任务
          </Button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {columns.map((col) => {
            const isDropTarget = dragOverColumn === col.id;
            return (
              <div
                key={col.id}
                className={[
                  'rounded-xl p-4 flex-1 min-w-[320px] flex flex-col transition-all',
                  isDropTarget
                    ? 'bg-blue-50 border-2 border-blue-400 border-dashed shadow-inner'
                    : 'bg-slate-100/50 border border-slate-200',
                ].join(' ')}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumn !== col.id) setDragOverColumn(col.id);
                }}
                onDragLeave={(e) => {
                  // 只有真正离开容器时才清除高亮，避免子节点抖动
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverColumn((prev) =>
                      prev === col.id ? null : prev,
                    );
                  }
                }}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="font-bold text-slate-700 flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full bg-${col.color}-500 mr-2`}
                    ></span>
                    {col.title}
                  </h3>
                  <span className="bg-white border border-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                    {tasks.filter((t) => t.status === col.id).length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {tasks
                    .filter((t) => t.status === col.id)
                    .map((task) => {
                      const isDragging = draggingTaskId === task.id;
                      const isArchived = task.status === 'archived';
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onDoubleClick={() =>
                            setTaskModal({
                              isOpen: true,
                              isEdit: true,
                              data: task,
                            })
                          }
                          className={[
                            'relative bg-white p-4 rounded-lg shadow-sm border cursor-move transition-all group',
                            isDragging
                              ? 'opacity-40 ring-2 ring-blue-400 scale-[0.98]'
                              : isArchived
                              ? 'border-slate-200 opacity-60 hover:opacity-90 hover:border-amber-300'
                              : 'border-slate-200 hover:shadow-md hover:border-blue-300',
                          ].join(' ')}
                        >
                          {/* 归档 / 恢复 快捷按钮 */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                            <button
                              type="button"
                              aria-label={isArchived ? '从归档恢复' : '归档任务'}
                              title={isArchived ? '恢复到待办' : '归档任务'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChangeTaskStatus(
                                  task.id,
                                  isArchived ? 'todo' : 'archived',
                                );
                              }}
                              className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            >
                              {isArchived ? (
                                <ArchiveRestore size={14} />
                              ) : (
                                <Archive size={14} />
                              )}
                            </button>
                            <button
                              type="button"
                              aria-label="删除任务"
                              title="删除任务"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex justify-between items-start mb-2 pr-6">
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded max-w-[120px] truncate">
                              {getProjectName(task.projectId)}
                            </span>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${priorityMap[task.priority].color}`}
                            >
                              {priorityMap[task.priority].label}
                            </span>
                          </div>

                          <h4
                            className={`text-sm font-bold mb-2 ${
                              task.status === 'done' || isArchived
                                ? 'line-through text-slate-400'
                                : 'text-slate-800'
                            }`}
                          >
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
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{task.id}</span>
                              {task.startDate && (
                                <span className="flex items-center text-slate-500">
                                  <Calendar size={11} className="mr-0.5" />
                                  {task.startDate.slice(5)}
                                </span>
                              )}
                            </div>
                            {task.assignee && (
                              <div className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                                <User size={12} className="mr-1" />{' '}
                                {task.assignee}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {tasks.filter((t) => t.status === col.id).length === 0 && (
                    <div
                      className={[
                        'border-2 border-dashed rounded-lg h-24 flex items-center justify-center text-sm transition-colors',
                        isDropTarget
                          ? 'border-blue-400 text-blue-500 bg-white/60'
                          : 'border-slate-200 text-slate-400',
                      ].join(' ')}
                    >
                      拖拽至此
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Modal
          open={taskModal.isOpen}
          onClose={closeTaskModal}
          title={taskModal.isEdit ? '编辑任务' : '新建任务'}
        >
          <form
            onSubmit={handleSaveTask}
            className="p-6 space-y-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                任务名称 *
              </label>
              <input
                value={taskModal.data.title || ''}
                onChange={(e) =>
                  setTaskModal({
                    ...taskModal,
                    data: { ...taskModal.data, title: e.target.value },
                  })
                }
                aria-invalid={!!taskErrors.title}
                aria-describedby={
                  taskErrors.title ? 'task-title-err' : undefined
                }
                className={inputClass(!!taskErrors.title)}
              />
              <FieldError id="task-title-err" message={taskErrors.title} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                任务描述
              </label>
              <textarea
                rows="4"
                value={taskModal.data.description || ''}
                onChange={(e) =>
                  setTaskModal({
                    ...taskModal,
                    data: { ...taskModal.data, description: e.target.value },
                  })
                }
                placeholder="详细描述任务要求..."
                className={inputClass(false)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  所属项目 *
                </label>
                <select
                  value={taskModal.data.projectId || ''}
                  onChange={(e) =>
                    setTaskModal({
                      ...taskModal,
                      data: { ...taskModal.data, projectId: e.target.value },
                    })
                  }
                  aria-invalid={!!taskErrors.projectId}
                  aria-describedby={
                    taskErrors.projectId ? 'task-project-err' : undefined
                  }
                  className={inputClass(!!taskErrors.projectId)}
                >
                  <option value="" disabled>
                    选择项目...
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="task-project-err"
                  message={taskErrors.projectId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  指派给
                </label>
                <select
                  value={taskModal.data.assignee || ''}
                  onChange={(e) =>
                    setTaskModal({
                      ...taskModal,
                      data: { ...taskModal.data, assignee: e.target.value },
                    })
                  }
                  className={inputClass(false)}
                >
                  <option value="">未指派</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  优先级
                </label>
                <select
                  value={taskModal.data.priority || 'medium'}
                  onChange={(e) =>
                    setTaskModal({
                      ...taskModal,
                      data: { ...taskModal.data, priority: e.target.value },
                    })
                  }
                  className={inputClass(false)}
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  起始日期
                </label>
                <input
                  type="date"
                  value={taskModal.data.startDate || ''}
                  onChange={(e) =>
                    setTaskModal({
                      ...taskModal,
                      data: { ...taskModal.data, startDate: e.target.value },
                    })
                  }
                  className={inputClass(false)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={closeTaskModal}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  };

  const renderBugs = () => {
    const severityMap = {
      critical: { label: '致命', color: 'bg-red-600 text-white' },
      major: { label: '严重', color: 'bg-orange-500 text-white' },
      minor: { label: '一般', color: 'bg-blue-500 text-white' },
      trivial: { label: '轻微', color: 'bg-slate-400 text-white' },
    };

    const bugStatusMap = {
      open: {
        label: '待处理',
        color: 'bg-red-50 text-red-600 border-red-200',
      },
      fixing: {
        label: '修复中',
        color: 'bg-blue-50 text-blue-600 border-blue-200',
      },
      fixed: {
        label: '已修复',
        color: 'bg-green-50 text-green-600 border-green-200',
      },
      closed: {
        label: '已归档',
        color: 'bg-slate-100 text-slate-500 border-slate-200',
      },
    };

    return (
      <div className="animate-in fade-in duration-300 h-full flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Bug 追踪</h1>
            <p className="text-slate-500 text-sm">
              记录缺陷、复现步骤及状态流转
            </p>
          </div>
          <Button
            variant="danger"
            icon={<Plus size={16} />}
            onClick={() =>
              setBugModal({
                isOpen: true,
                isEdit: false,
                data: {
                  title: '',
                  projectId: projects[0]?.id || '',
                  steps: '',
                  priority: 'high',
                  severity: 'major',
                  assignee: '',
                  status: 'open',
                  attachments: [],
                },
              })
            }
          >
            提 Bug
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-4">
          {bugs.map((bug) => (
            <div
              key={bug.id}
              className={`bg-white rounded-lg border shadow-sm p-5 transition-all relative group ${bug.status === 'closed' ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}`}
            >
              <div className="hidden group-hover:flex space-x-1 bg-white shadow-sm border border-slate-100 rounded p-1 absolute top-4 right-4 z-10">
                <IconButton
                  label="编辑 Bug"
                  onClick={() =>
                    setBugModal({ isOpen: true, isEdit: true, data: bug })
                  }
                >
                  <Edit size={14} />
                </IconButton>
                <IconButton
                  label="删除 Bug"
                  tone="danger"
                  onClick={() => handleDeleteBug(bug.id)}
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>

              <div className="flex justify-between items-start mb-3 pr-16">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded shadow-sm ${severityMap[bug.severity].color}`}
                  >
                    {severityMap[bug.severity].label}
                  </span>
                  <h3
                    className={`font-bold text-lg ${bug.status === 'closed' ? 'text-slate-500 line-through' : 'text-slate-800'}`}
                  >
                    {bug.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={bug.status}
                    onChange={(e) =>
                      handleChangeBugStatus(bug.id, e.target.value)
                    }
                    aria-label={`修改 Bug ${bug.title} 的状态`}
                    className={`text-xs font-medium px-2 py-1 rounded border outline-none cursor-pointer ${bugStatusMap[bug.status].color}`}
                  >
                    {Object.entries(bugStatusMap).map(([key, val]) => (
                      <option
                        key={key}
                        value={key}
                        className="text-slate-800 bg-white"
                      >
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                  所属项目: {getProjectName(bug.projectId)}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded border ${priorityMap[bug.priority].color}`}
                >
                  优先级: {priorityMap[bug.priority].label}
                </span>
                {bug.assignee && (
                  <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <User size={12} className="mr-1" /> {bug.assignee}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-1 flex items-center">
                  <AlignLeft size={14} className="mr-1" /> 复现步骤:
                </p>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm text-slate-600 whitespace-pre-wrap font-mono">
                  {bug.steps || '未提供复现步骤'}
                </div>
                {renderAttachments(bug.attachments)}
              </div>
            </div>
          ))}
          {bugs.length === 0 && (
            <EmptyState
              icon={<Bug size={22} />}
              title="目前没有记录任何 Bug"
              description="一切都很顺利。如果发现问题，记得点击右上角“提 Bug”。"
            />
          )}
        </div>

        <Modal
          open={bugModal.isOpen}
          onClose={closeBugModal}
          title={bugModal.isEdit ? '编辑 Bug' : '提交 Bug'}
          headerTone="danger"
          headerIcon={<Bug size={18} />}
        >
          <form
            onSubmit={handleSaveBug}
            className="p-6 space-y-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bug 标题 *
              </label>
              <input
                value={bugModal.data.title || ''}
                onChange={(e) =>
                  setBugModal({
                    ...bugModal,
                    data: { ...bugModal.data, title: e.target.value },
                  })
                }
                aria-invalid={!!bugErrors.title}
                aria-describedby={bugErrors.title ? 'bug-title-err' : undefined}
                className={inputClass(!!bugErrors.title, 'red')}
              />
              <FieldError id="bug-title-err" message={bugErrors.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  所属项目 *
                </label>
                <select
                  value={bugModal.data.projectId || ''}
                  onChange={(e) =>
                    setBugModal({
                      ...bugModal,
                      data: { ...bugModal.data, projectId: e.target.value },
                    })
                  }
                  aria-invalid={!!bugErrors.projectId}
                  aria-describedby={
                    bugErrors.projectId ? 'bug-project-err' : undefined
                  }
                  className={inputClass(!!bugErrors.projectId, 'red')}
                >
                  <option value="" disabled>
                    选择项目...
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="bug-project-err"
                  message={bugErrors.projectId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  指派给
                </label>
                <select
                  value={bugModal.data.assignee || ''}
                  onChange={(e) =>
                    setBugModal({
                      ...bugModal,
                      data: { ...bugModal.data, assignee: e.target.value },
                    })
                  }
                  className={inputClass(false, 'red')}
                >
                  <option value="">未指派</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                复现步骤 *
              </label>
              <textarea
                rows="4"
                value={bugModal.data.steps || ''}
                onChange={(e) =>
                  setBugModal({
                    ...bugModal,
                    data: { ...bugModal.data, steps: e.target.value },
                  })
                }
                placeholder="1. 打开页面...&#10;2. 点击按钮...&#10;3. 预期结果... 实际结果..."
                aria-invalid={!!bugErrors.steps}
                aria-describedby={bugErrors.steps ? 'bug-steps-err' : undefined}
                className={`${inputClass(!!bugErrors.steps, 'red')} font-mono text-sm`}
              />
              <FieldError id="bug-steps-err" message={bugErrors.steps} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                素材（图片/视频）
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleAttachmentChange('bug', e.target.files)}
                className={inputClass(false, 'red')}
              />
              {bugModal.data.attachments?.length ? (
                <div>
                  <div className="mt-3 text-xs font-medium text-slate-500">
                    素材预览
                  </div>
                  {renderAttachments(bugModal.data.attachments, {
                    showMeta: true,
                    canRemove: true,
                    onRemove: (id) => removeAttachment('bug', id),
                  })}
                </div>
              ) : (
                <div className="mt-2 rounded border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">
                  未选择素材
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  严重程度
                </label>
                <select
                  value={bugModal.data.severity || 'major'}
                  onChange={(e) =>
                    setBugModal({
                      ...bugModal,
                      data: { ...bugModal.data, severity: e.target.value },
                    })
                  }
                  className={inputClass(false, 'red')}
                >
                  {Object.entries(severityMap).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  优先级
                </label>
                <select
                  value={bugModal.data.priority || 'high'}
                  onChange={(e) =>
                    setBugModal({
                      ...bugModal,
                      data: { ...bugModal.data, priority: e.target.value },
                    })
                  }
                  className={inputClass(false, 'red')}
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  状态
                </label>
                <select
                  value={bugModal.data.status || 'open'}
                  onChange={(e) =>
                    setBugModal({
                      ...bugModal,
                      data: { ...bugModal.data, status: e.target.value },
                    })
                  }
                  className={inputClass(false, 'red')}
                >
                  {Object.entries(bugStatusMap).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={closeBugModal}>
                取消
              </Button>
              <Button variant="danger" type="submit">
                {bugModal.isEdit ? '保存更改' : '提交 Bug'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  };

  const renderMembers = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">成员管理</h1>
          <p className="text-slate-500 text-sm">
            管理系统账户与权限 (仅管理员可用)
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() =>
            setUserModal({
              isOpen: true,
              username: '',
              password: '',
              role: 'user',
            })
          }
        >
          新增账户
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
              <th className="font-medium py-3 px-4 w-1/3">用户名</th>
              <th className="font-medium py-3 px-4 w-1/3">角色</th>
              <th className="font-medium py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-4 px-4 text-sm font-medium text-slate-800">
                  {user.username}
                </td>
                <td className="py-4 px-4 text-sm text-slate-600">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {user.role === 'admin' ? '管理员' : '普通成员'}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  {user.username !== 'root' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      删除
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={userModal.isOpen}
        onClose={closeUserModal}
        title="新增账户"
        size="md"
      >
        <form onSubmit={handleAddUser} className="p-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              用户名 *
            </label>
            <input
              value={userModal.username}
              onChange={(e) =>
                setUserModal({ ...userModal, username: e.target.value })
              }
              placeholder="输入登录账号"
              aria-invalid={!!userErrors.username}
              aria-describedby={
                userErrors.username ? 'user-name-err' : undefined
              }
              className={inputClass(!!userErrors.username)}
            />
            <FieldError id="user-name-err" message={userErrors.username} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              初始密码 *
            </label>
            <input
              type="password"
              value={userModal.password}
              onChange={(e) =>
                setUserModal({ ...userModal, password: e.target.value })
              }
              placeholder="设置初始密码"
              aria-invalid={!!userErrors.password}
              aria-describedby={
                userErrors.password ? 'user-pwd-err' : undefined
              }
              className={inputClass(!!userErrors.password)}
            />
            <FieldError id="user-pwd-err" message={userErrors.password} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              账户角色
            </label>
            <select
              value={userModal.role}
              onChange={(e) =>
                setUserModal({ ...userModal, role: e.target.value })
              }
              className={inputClass(false)}
            >
              <option value="user">普通成员</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={closeUserModal}>
              取消
            </Button>
            <Button type="submit">创建账户</Button>
          </div>
        </form>
      </Modal>
    </div>
  );

  const renderLogin = () => (
    <div className="flex h-screen w-screen bg-slate-50 items-center justify-center font-sans p-4 relative overflow-hidden">
      {/* 动态模糊背景色块 */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/30 mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-400/30 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-cyan-400/30 mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/50 animate-in zoom-in-95 duration-300 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 relative">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-[2px] opacity-0 transition-opacity"></div>
            <LayoutDashboard size={30} className="text-white relative z-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
          欢迎登录 ZenFlow
        </h1>
        <p className="text-center text-slate-500 text-sm mb-8">
          轻量级团队项目管理工具
        </p>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="login-username"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              用户名
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="login-username"
                required
                disabled={loginLoading}
                value={loginData.username}
                onChange={(e) => {
                  setLoginData({ ...loginData, username: e.target.value });
                  setLoginError('');
                }}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg outline-none transition-all bg-white/50 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                  loginError
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="请输入用户名"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              密码
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="login-password"
                required
                disabled={loginLoading}
                type="password"
                value={loginData.password}
                onChange={(e) => {
                  setLoginData({ ...loginData, password: e.target.value });
                  setLoginError('');
                }}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg outline-none transition-all bg-white/50 backdrop-blur-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                  loginError
                    ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="请输入密码"
              />
            </div>
          </div>
          {loginError && (
            <p
              role="alert"
              className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2"
            >
              {loginError}
            </p>
          )}
          <Button type="submit" size="lg" loading={loginLoading} className="w-full shadow-lg shadow-blue-500/30">
            登录
          </Button>
        </form>
      </div>
    </div>
  );

  // 侧栏菜单复用
  const sidebarMenus = [
    { id: 'overview', name: '概览', icon: <LayoutDashboard size={18} /> },
    { id: 'projects', name: '项目', icon: <FolderKanban size={18} /> },
    { id: 'requirements', name: '需求', icon: <ListTodo size={18} /> },
    { id: 'tasks', name: '任务', icon: <CheckSquare size={18} /> },
    { id: 'bugs', name: 'Bug', icon: <Bug size={18} /> },
  ];

  if (!currentUser) {
    return renderLogin();
  }

  const sidebarContent = (
    <>
      <div className="h-[72px] flex items-center justify-between px-6 mb-2 border-b border-white/5">
        <div className="text-white font-bold text-xl flex items-center tracking-wide">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3 shadow-md">
            <LayoutDashboard size={18} className="text-slate-900" />
          </div>
          ZenFlow
        </div>
        <button
          type="button"
          aria-label="关闭菜单"
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
        {[
          ...sidebarMenus,
          ...(currentUser.role === 'admin'
            ? [{ id: 'members', name: '成员', icon: <Users size={18} /> }]
            : []),
        ].map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${activeMenu === menu.id ? "bg-white/10 text-white font-medium shadow-sm ring-1 ring-white/10" : "hover:bg-white/5 hover:text-slate-200"}`}
          >
            <span
              className={`mr-3 ${activeMenu === menu.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}
            >
              {menu.icon}
            </span>
            <span className="text-sm">{menu.name}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 bg-[#000c17]">
        <div className="px-2 mb-3">
          <p className="text-xs text-slate-500 mb-1">当前登录</p>
          <p className="text-sm text-slate-300 truncate font-medium flex items-center">
            {currentUser.username}
            <span className="text-[10px] ml-2 px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
              {currentUser.role === 'admin' ? '管理员' : '成员'}
            </span>
          </p>
        </div>
        <button
          onClick={() =>
            setPwdModal({
              isOpen: true,
              oldPwd: '',
              newPwd: '',
              confirmPwd: '',
            })
          }
          className="w-full flex items-center px-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors mb-1"
        >
          <KeyRound size={16} className="mr-2" /> 修改密码
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <LogOut size={16} className="mr-2" /> 退出登录
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-slate-900 selection:bg-slate-900 selection:text-white relative bg-dot-pattern">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-purple-50/50 pointer-events-none"></div>
      {/* 桌面端侧栏 */}
      <aside className="hidden lg:flex w-[260px] bg-slate-950 text-slate-400 flex-col z-10 flex-shrink-0 shadow-xl border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* 移动端抽屉 */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!mobileNavOpen}
      >
        <div
          className="absolute inset-0 bg-slate-900/60"
          onClick={() => setMobileNavOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[280px] bg-slate-950 text-slate-400 flex flex-col shadow-2xl transition-transform duration-200 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
          role="dialog"
          aria-label="主导航"
        >
          {sidebarContent}
        </aside>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto relative bg-transparent">
        {/* 顶部标题栏/导览可以放这里 */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white/60 backdrop-blur-xl border-b border-white/40 px-8 py-4 items-center justify-between shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {
              {
                overview: "数据概览",
                projects: "项目管理",
                requirements: "需求池",
                tasks: "任务看板",
                bugs: "缺陷追踪",
                members: "成员管理"
              }[activeMenu]
            }
          </h2>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm border border-white">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        {/* 移动端顶栏 */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            type="button"
            aria-label="打开菜单"
            onClick={() => setMobileNavOpen(true)}
            className="p-2 -ml-2 rounded text-slate-600 hover:bg-slate-100 active:scale-95 transition"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-slate-800">ZenFlow</span>
          <span className="w-6" />
        </div>

        <div
          className={`p-4 sm:p-8 ${activeMenu === 'tasks' ? 'max-w-none' : 'max-w-[1400px]'} mx-auto h-full`}
        >
          {activeMenu === 'overview' && renderOverview()}
          {activeMenu === 'projects' && renderProjects()}
          {activeMenu === 'requirements' && renderRequirements()}
          {activeMenu === 'tasks' && renderTasks()}
          {activeMenu === 'bugs' && renderBugs()}
          {activeMenu === 'members' &&
            currentUser.role === 'admin' &&
            renderMembers()}
        </div>

        {/* 修改密码 Modal */}
        <Modal
          open={pwdModal.isOpen}
          onClose={closePwdModal}
          title="修改密码"
          size="sm"
          headerIcon={<KeyRound size={16} />}
        >
          <form onSubmit={handleChangePwd} className="p-6 space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                原密码
              </label>
              <input
                type="password"
                value={pwdModal.oldPwd}
                onChange={(e) =>
                  setPwdModal({ ...pwdModal, oldPwd: e.target.value })
                }
                aria-invalid={!!pwdErrors.oldPwd}
                aria-describedby={pwdErrors.oldPwd ? 'pwd-old-err' : undefined}
                className={inputClass(!!pwdErrors.oldPwd)}
              />
              <FieldError id="pwd-old-err" message={pwdErrors.oldPwd} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                新密码
              </label>
              <input
                type="password"
                value={pwdModal.newPwd}
                onChange={(e) =>
                  setPwdModal({ ...pwdModal, newPwd: e.target.value })
                }
                aria-invalid={!!pwdErrors.newPwd}
                aria-describedby={pwdErrors.newPwd ? 'pwd-new-err' : undefined}
                className={inputClass(!!pwdErrors.newPwd)}
              />
              <FieldError id="pwd-new-err" message={pwdErrors.newPwd} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                确认新密码
              </label>
              <input
                type="password"
                value={pwdModal.confirmPwd}
                onChange={(e) =>
                  setPwdModal({ ...pwdModal, confirmPwd: e.target.value })
                }
                aria-invalid={!!pwdErrors.confirmPwd}
                aria-describedby={
                  pwdErrors.confirmPwd ? 'pwd-confirm-err' : undefined
                }
                className={inputClass(!!pwdErrors.confirmPwd)}
              />
              <FieldError
                id="pwd-confirm-err"
                message={pwdErrors.confirmPwd}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={closePwdModal}>
                取消
              </Button>
              <Button type="submit">确认修改</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
