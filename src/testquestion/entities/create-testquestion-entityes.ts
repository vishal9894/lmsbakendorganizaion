import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity('testquestions')
export class CreateTestquestionEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    contentId!: string;

    @Column({ type: 'text', nullable: true })
    question?: string;

    @Column({ nullable: true })
    questionImage?: string;

    @Column({ type: 'text', nullable: true })
    option_a?: string;

    @Column({ type: 'text', nullable: true })
    option_b?: string;

    @Column({ type: 'text', nullable: true })
    option_c?: string;

    @Column({ type: 'text', nullable: true })
    option_d?: string;

    @Column({ type: 'text', nullable: true })
    option_e?: string;

    @Column({ nullable: true })
    option_a_image?: string;

    @Column({ nullable: true })
    option_b_image?: string;

    @Column({ nullable: true })
    option_c_image?: string;

    @Column({ nullable: true })
    option_d_image?: string;

    @Column({ nullable: true })
    option_e_image?: string;

    @Column({ type: 'text', nullable: true })
    correctOption?: string;

    @Column({ type: 'float', nullable: true })
    marks?: number;

    @Column({ type: 'text', nullable: true })
    solution?: string;

    @Column({ nullable: true })
    solutionImage?: string;

    @Column({ default: 0 })
    questionNumber?: number;

    @CreateDateColumn()
    createdAt!: Date;
}