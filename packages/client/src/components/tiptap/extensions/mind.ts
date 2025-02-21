import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MindWrapper } from '../components/mind';

const DEFAULT_MIND_DATA = {
  meta: {
    name: 'jsMind',
    author: 'think',
    version: '0.2',
  },
  format: 'node_tree',
  data: { id: 'root', topic: '中心节点', children: [] },
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mind: {
      setMind: (attrs?: unknown) => ReturnType;
    };
  }
}

export const Mind = Node.create({
  name: 'jsmind',
  content: '',
  marks: '',
  group: 'block',
  draggable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        'data-type': 'jsmind',
      },
    };
  },

  addAttributes() {
    return {
      width: {
        default: '100%',
      },
      height: {
        default: 240,
      },
      data: {
        default: DEFAULT_MIND_DATA,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="jsmind"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  // @ts-ignore
  addCommands() {
    return {
      setMind:
        (options) =>
        ({ tr, commands, chain, editor }) => {
          // @ts-ignore
          if (tr.selection?.node?.type?.name == this.name) {
            return commands.updateAttributes(this.name, options);
          }

          const { selection } = editor.state;
          const pos = selection.$head;
          return chain()
            .insertContentAt(pos.before(), [
              {
                type: this.name,
                attrs: { data: DEFAULT_MIND_DATA },
              },
            ])
            .run();
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MindWrapper);
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^\$mind $/,
        type: this.type,
        getAttributes: (match) => {
          return { type: match[1] };
        },
      }),
    ];
  },
});
