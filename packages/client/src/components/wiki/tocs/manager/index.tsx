import React, { useEffect, useState } from 'react';
import { Banner, Tree, Button, Toast, Typography } from '@douyinfe/semi-ui';
import { DataRender } from 'components/data-render';
import { useWikiTocs } from 'data/wiki';
import styles from './index.module.scss';

interface IProps {
  wikiId: string;
}

interface IDataNode {
  index: number;
  key: string;
  id: string;
  parentDocumentId?: string;
  children?: Array<IDataNode>;
}

const { Title, Text } = Typography;

const extractRelation = (treeData: Array<IDataNode>) => {
  const res = [];
  const data = [...treeData] as IDataNode[];
  let index = 0;

  while (data.length) {
    const node = data.shift();
    res.push({
      index,
      id: node.id,
      parentDocumentId: node.parentDocumentId,
    });
    index++;
    if (node.children && node.children.length) {
      data.push(...node.children.map((sub, j) => ({ ...sub, index: j })));
    }
  }

  return res;
};

export const WikiTocsManager: React.FC<IProps> = ({ wikiId }) => {
  const { data: tocs, loading: tocsLoading, error: tocsError, update: updateTocs } = useWikiTocs(wikiId);

  const [treeData, setTreeData] = useState([]);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (!tocs || !tocs.length) return;
    setTreeData(tocs);
  }, [tocs]);

  function onDrop(info) {
    const { dropToGap, node, dragNode } = info;
    const dropKey = node.key;
    const dragKey = dragNode.key;
    const dropPos = node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const data = [...treeData];
    const loop = (data, key, callback) => {
      data.forEach((item, ind, arr) => {
        if (item.key === key) return callback(item, ind, arr);
        if (item.children) return loop(item.children, key, callback);
      });
    };
    let dragObj;
    loop(data, dragKey, (item, ind, arr) => {
      arr.splice(ind, 1);
      dragObj = item;
    });

    if (!dropToGap) {
      loop(data, dropKey, (item, ind, arr) => {
        item.children = item.children || [];
        dragObj.parentDocumentId = item.id;
        item.children.push(dragObj);
      });
    } else if (dropPosition === 1 && node.children && node.expanded) {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        dragObj.parentDocumentId = item.id;
        item.children.unshift(dragObj);
      });
    } else {
      let dropNodeInd;
      let dropNodePosArr;
      loop(data, dropKey, (item, ind, arr) => {
        dropNodePosArr = arr;
        dropNodeInd = ind;
      });
      dragObj.parentDocumentId = null;
      if (dropPosition === -1) {
        dropNodePosArr.splice(dropNodeInd, 0, dragObj);
      } else {
        dropNodePosArr.splice(dropNodeInd + 1, 0, dragObj);
      }
    }
    setTreeData(data);
    setChanged(true);
  }

  const submit = () => {
    const data = extractRelation(treeData);
    updateTocs(data).then(() => {
      setChanged(false);
      Toast.success('目录已更新');
    });
  };

  return (
    <div className={styles.wrap}>
      <Banner
        fullMode={false}
        type="info"
        icon={null}
        closeIcon={null}
        title={<Title heading={5}>目录管理</Title>}
        description={<Text>在下方进行拖拽以重新整理目录结构</Text>}
        style={{ marginBottom: 16 }}
      />
      <div className={styles.tocsWrap}>
        <DataRender
          loading={tocsLoading}
          error={tocsError}
          normalContent={() => {
            return <Tree treeData={treeData} draggable onDrop={onDrop} expandAll />;
          }}
        />
      </div>
      <div className={styles.btnWrap}>
        <Button disabled={!changed} onClick={submit}>
          提交
        </Button>
      </div>
    </div>
  );
};
