import React from 'react';
import type { IComment, IUser } from '@think/domains';
import { Avatar, Typography, Space, Popconfirm, Skeleton } from '@douyinfe/semi-ui';
import { IconUser } from '@douyinfe/semi-icons';
import { LocaleTime } from 'components/locale-time';
import { useUser } from 'data/user';
import styles from './index.module.scss';

interface IProps {
  comment: IComment;
  replyComment: (comment: IComment) => void;
  editComment: (comment: IComment) => void;
  deleteComment: (comment: IComment) => void;
}

const { Text } = Typography;

export const CommentItem: React.FC<IProps> = ({ comment, replyComment, editComment, deleteComment }) => {
  if (!comment) return null;
  const { user } = useUser();
  const { createUser = {} } = comment;

  return (
    <div className={styles.wrap}>
      <div className={styles.leftWrap}>
        <Avatar size="small" src={(createUser as IUser).avatar}>
          <IconUser />
        </Avatar>
      </div>
      <div className={styles.rightWrap}>
        <header>
          <Space>
            <Text strong>{(createUser as IUser).name}</Text>
            <Text type="tertiary">
              <LocaleTime date={comment.createdAt} timeago />
            </Text>
          </Space>
        </header>
        <main className="ProseMirror">
          <div dangerouslySetInnerHTML={{ __html: comment.html }}></div>
        </main>
        <footer>
          <Space>
            <Text type="secondary" size="small" onClick={() => replyComment(comment)}>
              回复
            </Text>
            {user && user.id === comment.createUserId && (
              <Text type="secondary" size="small" onClick={() => editComment(comment)}>
                编辑
              </Text>
            )}
            <Popconfirm showArrow title="确认删除该评论？" onConfirm={() => deleteComment(comment)}>
              <Text type="secondary" size="small">
                删除
              </Text>
            </Popconfirm>
          </Space>
        </footer>
      </div>
    </div>
  );
};

export const CommentItemPlaceholder = () => {
  return (
    <div className={styles.wrap}>
      <div className={styles.leftWrap}>
        <Skeleton.Avatar size="small" />
      </div>
      <div className={styles.rightWrap}>
        <header>
          <Skeleton.Title style={{ width: 120 }} />
        </header>
        <main>
          <div>
            <Skeleton.Paragraph style={{ width: '100%' }} rows={3} />
          </div>
        </main>
      </div>
    </div>
  );
};
