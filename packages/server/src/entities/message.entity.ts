import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('message')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', comment: '用户 Id' })
  userId: string;

  @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
  title: string;

  @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
  message: string;

  @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
  url: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    comment: '更新时间',
  })
  updatedAt: Date;
}
