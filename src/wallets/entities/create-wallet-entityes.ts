import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('wallets')
export class Wallet {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        transformer: {
            to: (value: number) => value?.toString(),
            from: (value: string) => value ? parseFloat(value) : 0,
        },

    })
    balance!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}