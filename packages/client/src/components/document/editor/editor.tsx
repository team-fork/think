import React, { useMemo, useEffect } from 'react';
import cls from 'classnames';
import { useEditor, EditorContent } from '@tiptap/react';
import { Layout, Nav, BackTop, Toast } from '@douyinfe/semi-ui';
import { ILoginUser, IAuthority } from '@think/domains';
import { useToggle } from 'hooks/useToggle';
import {
  DEFAULT_EXTENSION,
  Document,
  DocumentWithTitle,
  getCollaborationExtension,
  getCollaborationCursorExtension,
  getProvider,
  destoryProvider,
  MenuBar,
} from 'components/tiptap';
import { DataRender } from 'components/data-render';
import { joinUser } from 'components/document/collaboration';
import styles from './index.module.scss';

const { Header, Content } = Layout;

interface IProps {
  user: ILoginUser;
  documentId: string;
  authority: IAuthority;
  className: string;
  style: React.CSSProperties;
}

export const Editor: React.FC<IProps> = ({ user, documentId, authority, className, style }) => {
  if (!user) return null;

  const provider = useMemo(() => {
    return getProvider({
      targetId: documentId,
      token: user.token,
      cacheType: 'EDITOR',
      user,
      docType: 'document',
      events: {
        onAwarenessUpdate({ states }) {
          joinUser({ states });
        },
      },
    });
  }, [documentId, user.token]);

  const noTitleEditor = useEditor({
    extensions: [...DEFAULT_EXTENSION, Document],
  });

  const editor = useEditor({
    editable: authority && authority.editable,
    extensions: [
      ...DEFAULT_EXTENSION,
      DocumentWithTitle,
      getCollaborationExtension(provider),
      getCollaborationCursorExtension(provider, user),
    ],
    editorProps: {
      // @ts-ignore
      noTitleEditor,
    },
  });
  const [loading, toggleLoading] = useToggle(true);

  useEffect(() => {
    provider.on('synced', () => {
      toggleLoading(false);
    });

    provider.on('status', async ({ status }) => {
      console.log('status', status);
    });

    return () => {
      destoryProvider(provider, 'EDITOR');
    };
  }, []);

  return (
    <DataRender
      loading={loading}
      error={null}
      normalContent={() => {
        return (
          <div className={styles.editorWrap}>
            <header className={className}>
              <div>
                <MenuBar editor={editor} />
              </div>
            </header>
            <main id="js-template-editor-container" style={style}>
              <div className={cls(styles.contentWrap, className)}>
                <EditorContent editor={editor} />
              </div>
              <BackTop target={() => document.querySelector('#js-template-editor-container')} />
            </main>
          </div>
        );
      }}
    />
  );
};
