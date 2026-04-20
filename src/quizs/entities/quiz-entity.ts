import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Question } from "./question-entity";

@Entity('quizzes')
export class Quiz {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    category!: string;

    @Column()
    name!: string;

    @Column()
    duration!: number;

    @Column({ nullable: true })
    createdBy?: string;

    @Column({ nullable: true })
    organizationId?: string;

    @Column({ nullable: true })
    questionCategory?: string;

    @Column({ nullable: true })
    numberOfQuestions?: number;

    @Column({ type: 'varchar', nullable: true })
    negativeMarking?: string;

    @Column({ type: 'boolean', nullable: true })
    advancedMode?: boolean;

    @Column({ type: 'boolean', nullable: true })
    showSolution?: boolean;

    @Column({ type: 'float', nullable: true })
    negativeMarks?: number;

    @OneToMany(() => Question, question => question.quiz, { cascade: true })
    questions?: Question[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;




}
