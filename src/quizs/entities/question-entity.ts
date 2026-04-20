import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Quiz } from "./quiz-entity";

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    quizId!: string;

    @ManyToOne(() => Quiz, quiz => quiz.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'quizId' })
    quiz?: Quiz;

    @Column({ nullable: true })
    category?: string;

    @Column({ type: 'text', nullable: true })
    question?: string;

    @Column({ nullable: true })
    questionImage?: string;

    @Column({ nullable: true })
    option_a?: string;

    @Column({ nullable: true })
    option_b?: string;

    @Column({ nullable: true })
    option_c?: string;

    @Column({ nullable: true })
    option_d?: string;

    @Column({ nullable: true })
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

    @Column({ nullable: true })
    correctOption?: string;

    @Column({ type: 'float', nullable: true })
    marks?: number;

    @Column({ type: 'text', nullable: true })
    solution?: string;

    @Column({ nullable: true })
    solutionImage?: string;

    @Column({ default: 0 })
    questionNumber?: number;
}
