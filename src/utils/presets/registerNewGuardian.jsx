const paymentFromTreasury = ({ presetParams, setPresetParams, client, theme }) => ({
  id: 'registerNewGuardian',
  name: 'Register New Guardian',
  description: 'Register a guardian',
  args: [
    {
      id: 'input-owner-address',
      name: 'ownerAddress',
      component: 'IconedInput',
      props: {
        icon: isAddress(presetParams[1]) ? <GoVerified color={theme.green} /> : null,
        inputProps: {
          style: {
            fontSize: 15
          },
          placeholder: 'Owner address ...',
          value: presetParams[1] || '',
          onChange: (_e) =>
            setPresetParams({
              ...presetParams,
              1: _e.target.value
            })
        }
      }
    },
    {
      id: 'input-guardian-address',
      name: 'guardianAddress',
      component: 'IconedInput',
      props: {
        icon: isAddress(presetParams[1]) ? <GoVerified color={theme.green} /> : null,
        inputProps: {
          style: {
            fontSize: 15
          },
          placeholder: 'Guardian address ...',
          value: presetParams[1] || '',
          onChange: (_e) =>
            setPresetParams({
              ...presetParams,
              1: _e.target.value
            })
        }
      }
    },
    {
      id: 'input-number-of-epochs',
      name: 'numberOfEpochs',
      component: 'NumericFormat',
      props: {
        type: 'text',
        thousandSeparator: true,
        style: {
          fontSize: 15
        },
        placeholder: 'Number of Epochs ...',
        value: presetParams[2] || '',
        onChange: (_e) =>
          setPresetParams({
            ...presetParams,
            2: _e.target.value
          })
      }
    }
  ],
  prepare: async () => {
    // TODO add script generation
  }
})

export default paymentFromTreasury
