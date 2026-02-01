'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Plus, Mail, Phone, Building2, Search, Filter } from 'lucide-react'
import Link from 'next/link'

type Partner = {
  id: string
  name: string
  organization_type: string
  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null
  relationship_type: string
  status: string
  created_by: { full_name: string } | null
}

export default function PartnersList({ partners, canCreate, initialType }: { partners: Partner[]; canCreate: boolean; initialType?: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>(initialType || 'all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'potential':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'contacted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ongoing_coordination':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'active_partner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'partner' 
      ? 'bg-teal-100 text-teal-800 border-teal-200'
      : 'bg-indigo-100 text-indigo-800 border-indigo-200'
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = 
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (partner.contact_person && partner.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (partner.contact_email && partner.contact_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        partner.organization_type.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || partner.status === statusFilter
      const matchesType = typeFilter === 'all' || partner.relationship_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [partners, searchQuery, statusFilter, typeFilter])

  if (partners.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No partners yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first partner</p>
          {canCreate && (
            <Link href="/partners/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Partner
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, contact person, organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="potential">Potential</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="ongoing_coordination">Ongoing Coordination</SelectItem>
                <SelectItem value="active_partner">Active Partner</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="sponsor">Sponsor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-600 pt-2">
            Showing {filteredPartners.length} of {partners.length} partners
          </p>
        </CardHeader>
      </Card>

      {/* Partners Grid */}
      {filteredPartners.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => (
            <Link key={partner.id} href={`/partners/${partner.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getTypeColor(partner.relationship_type)} border`}>
                      {partner.relationship_type}
                    </Badge>
                    <Badge className={`${getStatusColor(partner.status)} border`}>
                      {formatStatus(partner.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{partner.name}</CardTitle>
                  <CardDescription>{partner.organization_type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {partner.contact_person && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
                      {partner.contact_person}
                    </div>
                  )}
                  {partner.contact_email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{partner.contact_email}</span>
                    </div>
                  )}
                  {partner.contact_phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                      {partner.contact_phone}
                    </div>
                  )}
                  {partner.created_by && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Added by {partner.created_by.full_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No partners found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
