import {
  auth_roles,
  auth_user_assign_roles,
  auth_user_delete,
  auth_user_detail,
  auth_user_status,
  auth_user_update,
  auth_users,
} from '@/services/api';
import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { App, Avatar, Button, Card, Checkbox, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tag } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const PAGE_SIZE = 10;

const formatTime = (millis?: number) => (millis ? new Date(millis).toLocaleString() : '--');

const AuthUsers: React.FC = () => {
  const { message } = App.useApp();
  const [list, setList] = useState<API.AuthUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState<API.AuthRole[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<API.AuthUser | null>(null);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesTarget, setRolesTarget] = useState<API.AuthUser | null>(null);
  const [selectedRoleCodes, setSelectedRoleCodes] = useState<string[]>([]);
  const [editForm] = Form.useForm();

  const loadUsers = useCallback(async (p = page, kw = keyword) => {
    setLoading(true);
    try {
      const resp = await auth_users(kw, p, PAGE_SIZE);
      if (resp?.code === 1000 && resp.data) {
        setList(resp.data.items || []);
        setTotal(resp.data.total || 0);
      } else {
        message.error(resp?.message || '用户列表加载失败');
      }
    } finally {
      setLoading(false);
    }
  }, [page, keyword, message]);

  const loadRoles = useCallback(async () => {
    const resp = await auth_roles();
    if (resp?.code === 1000) {
      setRoles(resp.data || []);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openEdit = async (user: API.AuthUser) => {
    const resp = await auth_user_detail(user.id);
    const detail = resp?.code === 1000 && resp.data ? resp.data : user;
    setEditTarget(detail);
    editForm.setFieldsValue({
      nickname: detail.nickname,
      email: detail.email,
      phone: detail.phone,
      realName: detail.realName,
      gender: detail.gender,
      birthday: detail.birthday,
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    const values = await editForm.validateFields();
    const resp = await auth_user_update(editTarget!.id, values);
    if (resp?.code === 1000) {
      message.success('用户资料已更新');
      setEditOpen(false);
      loadUsers();
    } else {
      message.error(resp?.message || '更新失败');
    }
  };

  const openRoles = async (user: API.AuthUser) => {
    const resp = await auth_user_detail(user.id);
    const detail = resp?.code === 1000 && resp.data ? resp.data : user;
    setRolesTarget(detail);
    // 角色编码 → 角色 ID
    const codes = new Set(detail.roles || []);
    setSelectedRoleCodes((roles || []).filter((r) => codes.has(r.code)).map((r) => r.id));
    setRolesOpen(true);
  };

  const submitRoles = async () => {
    const resp = await auth_user_assign_roles(rolesTarget!.id, selectedRoleCodes);
    if (resp?.code === 1000) {
      message.success('角色已更新');
      setRolesOpen(false);
      loadUsers();
    } else {
      message.error(resp?.message || '角色分配失败');
    }
  };

  const toggleStatus = async (user: API.AuthUser, checked: boolean) => {
    const resp = await auth_user_status(user.id, checked ? 1 : 0);
    if (resp?.code === 1000) {
      message.success(checked ? '已启用' : '已禁用');
      loadUsers();
    } else {
      message.error(resp?.message || '状态更新失败');
    }
  };

  const removeUser = async (user: API.AuthUser) => {
    const resp = await auth_user_delete(user.id);
    if (resp?.code === 1000) {
      message.success('用户已删除');
      loadUsers();
    } else {
      message.error(resp?.message || '删除失败');
    }
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_: any, u: API.AuthUser) => (
        <Space>
          <Avatar src={u.avatar} style={{ backgroundColor: '#7A5638' }}>
            {(u.nickname || u.username || '?').slice(0, 1).toUpperCase()}
          </Avatar>
          <div>
            <div>{u.nickname || u.username}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{u.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      render: (v: string, u: API.AuthUser) =>
        v ? (
          <span>
            {v} {u.emailVerified && <Tag color="green">已验证</Tag>}
          </span>
        ) : (
          '--'
        ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      render: (v: string, u: API.AuthUser) =>
        v ? (
          <span>
            {v} {u.phoneVerified && <Tag color="green">已验证</Tag>}
          </span>
        ) : (
          '--'
        ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      render: (roles: string[]) =>
        (roles || []).map((r) => (
          <Tag key={r} color={r === 'ROLE_ADMIN' ? 'gold' : 'default'}>
            {r}
          </Tag>
        )),
    },
    { title: '注册时间', dataIndex: 'createdAt', render: (v: number) => formatTime(v), width: 170 },
    { title: '最近登录', dataIndex: 'lastLoginAt', render: (v: number) => formatTime(v), width: 170 },
    {
      title: '状态',
      key: 'status',
      width: 90,
      render: (_: any, u: API.AuthUser) => (
        <Switch
          checked={u.status === 1}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={(checked) => toggleStatus(u, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: any, u: API.AuthUser) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(u)}>
            编辑
          </Button>
          <Button size="small" icon={<TeamOutlined />} onClick={() => openRoles(u)}>
            角色
          </Button>
          <Popconfirm title={`确定删除用户 ${u.username} 吗？`} onConfirm={() => removeUser(u)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="用户管理"
      extra={
        <Space>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="用户名/昵称/邮箱"
            style={{ width: 220 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              loadUsers(1, keyword);
            }}
          />
          <Button
            icon={<SearchOutlined />}
            type="primary"
            onClick={() => {
              setPage(1);
              loadUsers(1, keyword);
            }}
          >
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => loadUsers()} />
        </Space>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns as any}
        dataSource={list}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          showTotal: (t) => `共 ${t} 个用户`,
          onChange: (p) => setPage(p),
        }}
      />

      <Modal
        title={`编辑用户 - ${editTarget?.username || ''}`}
        open={editOpen}
        onOk={submitEdit}
        onCancel={() => setEditOpen(false)}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" preserve={false}>
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="昵称" />
          </Form.Item>
          <Form.Item name="email" label="邮箱（管理员代改视为已验证）">
            <Input placeholder="邮箱，清空请留空后提交" />
          </Form.Item>
          <Form.Item name="phone" label="手机号（管理员代改视为已验证）">
            <Input placeholder="手机号" />
          </Form.Item>
          <Form.Item name="realName" label="真实姓名">
            <Input placeholder="真实姓名" />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select
              allowClear
              options={[
                { value: 0, label: '未知' },
                { value: 1, label: '男' },
                { value: 2, label: '女' },
              ]}
            />
          </Form.Item>
          <Form.Item name="birthday" label="生日">
            <Input placeholder="yyyy-MM-dd" />
          </Form.Item>
          <Form.Item
            name="password"
            label={
              <span>
                <KeyOutlined /> 重置密码（可选）
              </span>
            }
          >
            <Input.Password placeholder="留空表示不修改，6~50 位" minLength={6} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`分配角色 - ${rolesTarget?.username || ''}`}
        open={rolesOpen}
        onOk={submitRoles}
        onCancel={() => setRolesOpen(false)}
        destroyOnClose
      >
        <div style={{ marginBottom: 8, color: '#999' }}>勾选该用户的最终角色（全量覆盖）</div>
        <Checkbox.Group
          value={selectedRoleCodes}
          onChange={(vals) => setSelectedRoleCodes(vals as string[])}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          options={roles.map((r) => ({
            label: `${r.name}（${r.code}）`,
            value: r.id,
          }))}
        />
        <InputNumber style={{ display: 'none' }} />
      </Modal>
    </Card>
  );
};

export default AuthUsers;
