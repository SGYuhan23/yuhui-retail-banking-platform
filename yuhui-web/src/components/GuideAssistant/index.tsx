import { PushpinOutlined, RightOutlined } from '@ant-design/icons';
import { history, useLocation } from '@umijs/max';
import { Button, Card, Divider, Space, Typography, theme } from 'antd';
import React, { useEffect, useState } from 'react';

const { Link, Text } = Typography;
const CARD_INDEX_LABELS: Record<number, string> = {
  1: '一',
  2: '二',
};

const STORAGE_KEY = 'guide-assistant-collapsed';
export const OPEN_GUIDE_ASSISTANT_EVENT = 'open-guide-assistant';

type GuideItem = {
  label: string;
  href: string;
  note?: string;
  strike?: boolean;
};

type GuideSection = {
  title: string;
  items: GuideItem[];
};

type GuideCardData = {
  index: number;
  title: string;
  sections: GuideSection[];
};

const guideCards: GuideCardData[] = [
  {
    index: 1,
    title: '快速入门（创建一个简单的抽奖活动）',
    sections: [
      {
        title: '',
        items: [
          {
            label: '1. 添加奖品',
            href: '/lottery/award',
            note: '[+ 添加奖品] -> 信息请根据实际情况填写',
          },
          {
            label: '2. 创建活动',
            href: '/admin/activity',
            note: '[+ 新建活动] -> 抽奖策略ID请选择默认策略，其他信息请根据实际情况填写',
          },
          {
            label: '3. 配置抽奖奖品',
            href: '/admin/activity-award',
            note:
              '[+ 新建活动奖品] -> 活动ID选你刚刚创建的那个活动，奖品规则ID请选择默认规则，其他信息请根据实际情况填写（配置后可在活动面板直接跳转）',
          },
          {
            label: '4. 配置初始抽奖次数',
            href: '/rebate/behavior_rebate',
            note:
              '[+ 新建返利配置] -> 活动ID选你刚刚创建的那个活动，行为类型请选择活动赠送，返利类型请选择抽奖次数-活动赠送，返利配置即为单次赠送的次数，其他信息请根据实际情况填写（配置后可在活动面板直接跳转）',
          },
        ],
      },
    ],
  },
  {
    index: 2,
    title: '高级使用（解锁更高级的用法）',
    sections: [
      {
        title: '抽奖与返利配置',
        items: [
          {
            label: '1. 添加奖品',
            href: '/lottery/award',
            note: '[+ 添加奖品] -> 信息请根据实际情况填写',
          },
          {
            label: '2. 创建规则模型',
            href: '/strategy/rule',
            note:
              '[+ 新建规则] -> \n - 黑名单规则：规则模型命名需包含rule_backlist字段，规则值为 策略ID:黑名单用户ID列表 \n - 权重规则：规则模型命名需包含rule_weight字段，规则值为 要达到的抽奖次数:必中奖品ID列表',
          },
          {
            label: '3. 创建抽奖策略',
            href: '/strategy/strategy',
            note:
              '[+ 新建策略] -> 规则模型选择你上一步新建的规则模型（按选择顺序校验）',
          },
          {
            label: '4. 创建规则树',
            href: '/strategy/tree',
            note: '[+ 新建规则树] -> 入口规则（rule_lock-次数锁/rule_stock-库存）',
          },
          {
            label: '5. 可视化编排规则树',
            href: '/strategy/tree-editor',
            note: '选择对应规则树进行配置',
          },
          {
            label: '6. 创建活动',
            href: '/admin/activity',
            note:
              '[+ 新建活动] -> 抽奖策略ID请选择默认策略、其他信息请根据实际情况填写',
          },
          {
            label: '7. 配置抽奖奖品',
            href: '/admin/activity-award',
            note:
              '[+ 新建活动奖品] -> 活动ID选你刚刚创建的那个活动、奖品规则ID请选择默认规则、其他信息请根据实际情况填写（配置后可在活动面板直接跳转）',
          },
          {
            label: '8. 配置初始抽奖次数',
            href: '/rebate/behavior_rebate',
            note:
              '[+ 新建返利配置] -> 活动ID选你刚刚创建的那个活动、行为类型请选择活动赠送、返利类型请选择抽奖次数-活动赠送，返利配置即为单次赠送的次数、其他信息请根据实际情况填写（配置后可在活动面板直接跳转）',
          },
          {
            label: '9. 配置返利次数',
            href: '/rebate/activity_count',
            note: '[+ 新建配置] -> 按需填写',
          },
          {
            label: '10. 配置积分兑换',
            href: '/rebate/activity_sku',
            note:
              '[+ 新建配置] -> 活动ID选你刚刚创建的那个活动、其他信息请根据实际情况填写（配置后可在活动面板直接跳转）',
          },
          {
            label: '11. 配置每日签到福利',
            href: '/rebate/behavior_rebate',
            note:
              '[+ 新建返利配置] -> 活动ID选你刚刚创建的那个活动、行为类型请选择签到、返利类型请选择签到相关、返利配置为签到赠送的积分数/赠送抽奖次数配置、其他信息请根据实际情况填写（配置后可在活动面板直接跳转）',
          },
        ],
      },
    ],
  },
];

const GuideLink: React.FC<GuideItem> = ({ href, label, note, strike }) => (
  <div style={{ marginBottom: 8 }}>
    <Link
      onClick={() => history.push(href)}
      style={{ display: 'inline-block', textDecoration: strike ? 'line-through' : undefined }}
    >
      {label}
    </Link>
    {note ? <div style={{ marginTop: 4, whiteSpace: 'pre-line' }}>{note}</div> : null}
  </div>
);

const GuideAssistant: React.FC = () => {
  const { token } = theme.useToken();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCollapsed(stored === '1');
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      setCollapsed(false);
      localStorage.setItem(STORAGE_KEY, '0');
    };

    window.addEventListener(OPEN_GUIDE_ASSISTANT_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_GUIDE_ASSISTANT_EVENT, handleOpen);
  }, []);

  if (pathname === '/user/login') {
    return null;
  }

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 1001,
        width: collapsed ? 56 : 360,
        transition: 'width 0.2s ease',
      }}
    >
      {collapsed ? (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PushpinOutlined />}
          onClick={toggleCollapsed}
          title={'展开操作指引'}
        />
      ) : (
        <Card
          className="guide-assistant-card"
          bodyStyle={{ padding: 0 }}
          style={{
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: token.boxShadowSecondary,
            border: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgElevated,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '62vh',
            }}
          >
            <div
              style={{
                flex: '0 0 auto',
                padding: 16,
                paddingBottom: 14,
                background: token.colorBgElevated,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <PushpinOutlined style={{ color: token.colorPrimary }} />
                  <Text strong style={{ fontSize: 16 }}>
                    {'操作指引'}
                  </Text>
                </Space>
                <Button type="text" size="small" icon={<RightOutlined />} onClick={toggleCollapsed} />
              </Space>
            </div>
            <div className="guide-assistant-scroll">
              <Divider style={{ margin: '0 0 14px' }} />
              <Space direction="vertical" size={12} style={{ width: '100%', padding: '0 16px 16px' }}>
                {guideCards.map((card) => (
                  <div
                    key={card.index}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: token.colorFillQuaternary,
                    }}
                  >
                    <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 15 }}>
                      {(CARD_INDEX_LABELS[card.index] || String(card.index)) + '、'} {card.title}
                    </Text>
                    {card.sections.map((section) => (
                      <div key={`${card.index}-${section.title}`} style={{ marginBottom: 12 }}>
                        {section.title ? (
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            {section.title}
                          </Text>
                        ) : null}
                        {section.items.map((item) => (
                          <GuideLink key={`${section.title}-${item.href}-${item.label}`} {...item} />
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </Space>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GuideAssistant;
