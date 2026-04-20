import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('social_media')
export class SocialMediaEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column( { nullable: false })
    name: string;

    @Column()
    url: string;

    @Column({ nullable: true })
    icon: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}