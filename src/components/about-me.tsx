"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Mail, Briefcase, ExternalLink, Clock, Github, Linkedin } from "lucide-react"
import Link from "next/link"

const SKILLS = [
  "Go",
  "Python",
  "AI",
]

const CAREER_START = new Date(2022, 8) // Sep 2022

const EXPERIENCE = [
  {
    role: "Software Engineer",
    company: "Rappi",
    period: "Aug 2025 - Present",
  },
  {
    role: "SSr Backend Developer",
    company: "Finanzauto",
    period: "Jan 2025 - Jul 2025",
  },
  {
    role: "Java Software Developer",
    company: "SIX DEGREES IT",
    period: "Oct 2024 - Jan 2025",
  },
  {
    role: "Backend Developer",
    company: "TopGroup S.A.",
    period: "Sep 2022 - Sep 2024",
  },
]

function useTotalExperience() {
  const [elapsed, setElapsed] = useState({ years: 0, months: 0 })

  useEffect(() => {
    function calc() {
      const now = new Date()
      let years = now.getFullYear() - CAREER_START.getFullYear()
      let months = now.getMonth() - CAREER_START.getMonth()
      if (months < 0) {
        years--
        months += 12
      }
      setElapsed({ years, months })
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [])

  return elapsed
}

function getInitials(name?: string | null): string {
  if (!name) return "SV"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function AboutMe() {
  const { user } = useAuth()
  const { years, months } = useTotalExperience()

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center gap-6 pb-0">
          <Avatar className="h-28 w-28">
            <AvatarImage src="/foto.jpg" alt="Stiven Valeriano" />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold text-foreground">
              Stiven Valeriano
            </h2>
            <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Briefcase className="h-4 w-4" />
              Software Engineer at Rappi
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Bogotá, Colombia
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                jsvaleriano321@live.com
              </span>
              <span className="flex items-center gap-1 font-medium text-primary">
                <Clock className="h-3.5 w-3.5" />
                {years}y {months}m exp
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Link
                href="https://github.com/stvgo"
                target="_blank"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Github className="h-3.5 w-3.5" /> GitHub <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/stiven-valeriano-b29113195/"
                target="_blank"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <p className="text-muted-foreground leading-relaxed">
            Golang developer and AI enthusiast building high-performance backend systems.
            I specialize in designing scalable server-side architectures with Go and leveraging
            AI to solve real-world problems. Passionate about clean code, distributed systems,
            and pushing the boundaries of what intelligent automation can deliver.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">Skills</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">Experience</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {EXPERIENCE.map((exp, i) => (
            <div key={i}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <h4 className="font-medium text-foreground">{exp.role}</h4>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                </div>
                <p className="text-xs text-muted-foreground">{exp.period}</p>
              </div>
              {i < EXPERIENCE.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}