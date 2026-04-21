import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum QuestionType {
    SINGLE_CORRECT = 'single_correct',
    MULTIPLE_CORRECT = 'multiple_correct',
}

export enum TimeType {
    STOPWATCH = 'stopwatch',
    COUNTDOWN = 'countdown',
}

export enum ExamMode {
    ONLINE = 'online',
    OFFLINE = 'offline',
}

@Entity("create_sheet")
export class CreateSheetEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    examKey: string;

    @Column({ nullable: true })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    questionNumber: number;

    @Column({
        type: 'enum',
        enum: QuestionType,
        default: QuestionType.SINGLE_CORRECT,
    })
    questionType: QuestionType;

    @Column({ type: 'simple-array', nullable: true })
    correctAnswers: string[];

    @Column({
        type: 'enum',
        enum: TimeType,
        default: TimeType.COUNTDOWN,
    })
    timeType: TimeType;

    @Column({ type: 'float', nullable: true, default: 0 })
    correctMarks: number;

    @Column({ type: 'float', nullable: true, default: 0 })
    wrongMarks: number;

    @Column({ nullable: true, default: 0 })
    duration: number;

    @Column({ type: 'boolean', default: true })
    status: boolean;

    @Column({
        type: 'enum',
        enum: ExamMode,
        default: ExamMode.ONLINE,
    })
    examMode: ExamMode;

    @Column({ nullable: true, default: 0 })
    bufferTime: number;

    @Column({ type: 'timestamp', nullable: true })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @Column({ type: 'text', nullable: true })
    optionA: string;

    @Column({ type: 'text', nullable: true })
    optionB: string;

    @Column({ type: 'text', nullable: true })
    optionC: string;

    @Column({ type: 'text', nullable: true })
    optionD: string;

    @Column({ type: 'text', nullable: true })
    optionE: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}