import { ArrowRight } from '@mui/icons-material'
import {
  Box,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Popover,
  Radio,
  RadioGroup,
  Slider,
  TextField,
} from '@mui/material'
import { t } from 'i18next'
import { useState } from 'react'
import { ZH_PERSON_RULES } from '../../../core/consts.js'
import type { ColorScheme } from '../../../core/store.js'
import {
  COLOR_SCHEMES,
  useAutoSection,
  usePersonReplace,
  useSpeechSpeed,
  useStopTimer,
  useStopTimerSeconds,
  useUserColorScheme,
} from '../../../core/store.js'
import { isMobile } from '../../../core/util/browser.js'
import { SettingLine } from './use-header.js'

const AutoSectionCheckBox = () => {
  const [autoNextSection, setAutoNextSection] = useAutoSection()
  return (
    <SettingLine>
      <FormControlLabel
        label={t('autoNextSectionSetting')}
        control={
          <Checkbox
            key="auto-next-section"
            checked={autoNextSection}
            onChange={(v) => {
              setAutoNextSection(v.currentTarget.checked)
            }}
          ></Checkbox>
        }
      ></FormControlLabel>
    </SettingLine>
  )
}

const TimerInput = () => {
  const [stopTimerEnabled, setStopTimerEnabled] = useStopTimer()
  const [stopTimerSeconds, setStopTimerSeconds] = useStopTimerSeconds()
  return (
    <SettingLine>
      <FormControlLabel
        label={t('timerSetting')}
        control={
          <Checkbox
            checked={stopTimerEnabled}
            onChange={(e) => {
              setStopTimerEnabled(e.target.checked)
            }}
          ></Checkbox>
        }
      ></FormControlLabel>
      <TextField
        type="nubmer"
        style={{ width: 80 }}
        disabled={!stopTimerEnabled}
        value={Math.floor(stopTimerSeconds / 60)}
        onChange={(v) => {
          const f = parseFloat(v.target.value)
          if (!isNaN(f)) setStopTimerSeconds(f * 60)
        }}
      ></TextField>
    </SettingLine>
  )
}

function PersonReplaceCheckBox(props: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const { checked, onChange } = props
  const [personReplaceOpened, setPersonReplaceOpened] = useState<boolean>(false)
  const [anchor, setAnchor] = useState<any>()

  return (
    <>
      <FormControlLabel
        onMouseEnter={(e) => {
          if (isMobile) return
          setAnchor(e.currentTarget)
          setPersonReplaceOpened(true)
        }}
        onMouseLeave={(e) => {
          setAnchor(e.currentTarget)
          setPersonReplaceOpened(false)
        }}
        label={t('personReplaceSetting')}
        control={
          <Checkbox
            checked={checked}
            onChange={(v) => {
              onChange(v.currentTarget.checked)
            }}
          ></Checkbox>
        }
      ></FormControlLabel>
      {!isMobile && (
        <Popover
          sx={{ pointerEvents: 'none' }}
          open={personReplaceOpened}
          anchorEl={anchor}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <List>
            {Object.entries(ZH_PERSON_RULES).map(([from, to], idx) => {
              return (
                <ListItem key={idx}>
                  {from} <ArrowRight /> {to}
                </ListItem>
              )
            })}
          </List>
        </Popover>
      )}
    </>
  )
}

const PersonReplaceUI = () => {
  const [isPersonReplace, setIsPersonReplace] = usePersonReplace()

  return (
    <SettingLine>
      <PersonReplaceCheckBox
        checked={isPersonReplace}
        onChange={(v) => {
          setIsPersonReplace(v)
        }}
      ></PersonReplaceCheckBox>
    </SettingLine>
  )
}

const PlaySpeed = () => {
  const [speechSpeed, setSpeechSpeed] = useSpeechSpeed()
  return (
    <SettingLine>
      <span>{t('speedSetting')}:</span>
      <Slider
        sx={{
          width: 80,
        }}
        defaultValue={speechSpeed}
        onChange={(_, v) => {
          setSpeechSpeed(v as number)
        }}
        step={0.1}
        min={0.1}
        max={5.0}
      ></Slider>
      <span>{speechSpeed}</span>
    </SettingLine>
  )
}

const ColorSchemeSelect = () => {
  const [userColorScheme, setUserColorScheme] = useUserColorScheme()
  return (
    <>
      <SettingLine>
        <span>{t('userColorSchemeSetting')}</span>
      </SettingLine>
      <Box sx={{ paddingLeft: 2 }}>
        <RadioGroup
          defaultValue={userColorScheme}
          onChange={(e) => {
            setUserColorScheme(e.target.value as ColorScheme)
          }}
        >
          {COLOR_SCHEMES.map((value) => {
            return (
              <FormControlLabel
                key={value}
                label={t(value)}
                value={value}
                control={<Radio></Radio>}
              ></FormControlLabel>
            )
          })}
        </RadioGroup>
      </Box>
    </>
  )
}

export const GlobalSettings = () => {
  return (
    <>
      <AutoSectionCheckBox></AutoSectionCheckBox>
      <TimerInput></TimerInput>
      <PersonReplaceUI></PersonReplaceUI>
      <PlaySpeed></PlaySpeed>
      <ColorSchemeSelect></ColorSchemeSelect>
    </>
  )
}
