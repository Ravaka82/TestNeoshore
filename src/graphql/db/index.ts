import mongoose from 'mongoose'
import envs from '../../utils/constant'

mongoose.connect(envs.dbUrl)

export default mongoose.connection