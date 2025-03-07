import { createPortal } from 'react-dom';
import { Space, Typography, Avatar } from '@douyinfe/semi-ui';
import { IconUser } from '@douyinfe/semi-icons';
import { IDocument } from '@think/domains';
import { LocaleTime } from 'components/locale-time';

export const CreateUser: React.FC<{ document: IDocument; container: () => HTMLElement }> = ({
  document,
  container = null,
}) => {
  if (!document.createUser) return null;

  const content = (
    <div
      style={{
        borderTop: '1px solid var(--semi-color-border)',
        marginTop: 24,
        padding: '16px 0',
        fontSize: 13,
        fontWeight: 'normal',
        color: 'var(--semi-color-text-0)',
      }}
    >
      <Space>
        <Avatar size="extra-extra-small" src={document.createUser && document.createUser.avatar}>
          <IconUser />
        </Avatar>
        <div>
          <p>
            创建者：
            {document.createUser && document.createUser.name}
          </p>
          <p>
            最近更新日期：
            <LocaleTime date={document.updatedAt} timeago />
            {' ⦁ '}阅读量：
            {document.views}
          </p>
        </div>
      </Space>
    </div>
  );

  const el = container && container();

  console.log(el);

  if (!el) return content;
  return createPortal(content, el);
};
