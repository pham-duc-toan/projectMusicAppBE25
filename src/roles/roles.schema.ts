import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as TSchema } from 'mongoose';
import { Permission } from 'src/permissions/permission.schema';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  roleName: string;

  @Prop({
    type: [{ type: TSchema.Types.ObjectId, ref: Permission.name }],
    default: [],
  })
  permissions: TSchema.Types.ObjectId[];

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: null })
  deletedAt: Date | null;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
