/**
 * GSAP singleton — registers ScrollTrigger once and exports the
 * configured gsap instance for the whole app.
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
