import { Column, Entity, ObjectIdColumn, PrimaryColumn } from 'typeorm';

@Entity('links')
export class Link {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  code: string;

  @Column()
  url: string;

  @Column()
  clicks: number;
}
