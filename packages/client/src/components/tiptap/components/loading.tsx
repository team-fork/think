import { NodeViewWrapper } from '@tiptap/react';
import { Spin } from '@douyinfe/semi-ui';

export const LoadingWrapper = ({ editor, node, updateAttributes }) => {
  const isEditable = editor.isEditable;
  const { text } = node.attrs;

  if (!isEditable) return <NodeViewWrapper />;

  return (
    <NodeViewWrapper as="div">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '1em',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        <Spin tip={text ? `正在上传${text}中...` : ''} />
      </div>
    </NodeViewWrapper>
  );
};
